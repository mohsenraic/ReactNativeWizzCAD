import {geoArea, geoBounds, geoContains, geoOrthographic, GeoProjection} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry, MultiLineString, Polygon, Position} from 'geojson';
import {feature, mesh} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import worldData from 'world-atlas/countries-50m.json';
import world10Data from 'world-atlas/countries-10m.json';
import type {Camera} from '../data/types';
import {MAP_CENTER_Y, WIDTH} from './constants';

const world = worldData as unknown as Topology<{
  countries: GeometryCollection<{name: string}>;
  land: GeometryCollection;
}>;

export const land = feature(world, world.objects.land) as FeatureCollection;
export const borders: MultiLineString = mesh(world, world.objects.countries, (a, b) => a !== b);
const countries = feature(world, world.objects.countries) as FeatureCollection<Geometry, {name: string}>;

export const getCountry = (iso: string): Feature | undefined =>
  countries.features.find((f) => String(f.id) === iso);

export const makeProjection = (c: Camera): GeoProjection =>
  geoOrthographic()
    .scale(c.scale)
    .translate([WIDTH / 2, MAP_CENTER_Y])
    .rotate([-c.lon, -c.lat, 0])
    .clipAngle(90)
    .precision(0.6);

/** Linear position, logarithmic scale (constant perceived zoom speed) */
export const lerpCamera = (a: Camera, b: Camera, p: number): Camera => ({
  lon: a.lon + (b.lon - a.lon) * p,
  lat: a.lat + (b.lat - a.lat) * p,
  scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * p),
});

// ---------------------------------------------------------------------------
// 10m detail, limited to the region around the place (close zoom on the
// coast). Computed once: the full 10m world would be far too slow per frame.
// ---------------------------------------------------------------------------

type BBox = [number, number, number, number];

const intersects = (b: [[number, number], [number, number]], box: BBox) =>
  b[0][0] <= box[2] && b[1][0] >= box[0] && b[0][1] <= box[3] && b[1][1] >= box[1];

export type RegionalLayers = {
  land: FeatureCollection;
  borders: MultiLineString;
  /** Polygon containing a given point (e.g. an island), if any */
  polygonAt: (lon: number, lat: number) => Polygon | null;
};

let regionalCache: {key: string; layers: RegionalLayers} | null = null;

export const getRegionalLayers = (lon: number, lat: number, pad = 2.5): RegionalLayers => {
  const key = `${lon},${lat},${pad}`;
  if (regionalCache?.key === key) return regionalCache.layers;
  const box: BBox = [lon - pad, lat - pad, lon + pad, lat + pad];
  const w10 = world10Data as unknown as Topology<{countries: GeometryCollection}>;
  const all = feature(w10, w10.objects.countries) as FeatureCollection;

  const polygons: Polygon[] = [];
  all.features.forEach((f) => {
    const g = f.geometry;
    const list: Position[][][] =
      g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    list.forEach((coordinates) => {
      let poly: Polygon = {type: 'Polygon', coordinates};
      // d3 expects clockwise rings: a reversed ring would cover the whole globe
      if (geoArea(poly) > 2 * Math.PI) {
        poly = {type: 'Polygon', coordinates: coordinates.map((ring) => [...ring].reverse())};
      }
      if (intersects(geoBounds(poly), box)) polygons.push(poly);
    });
  });

  const fullMesh = mesh(w10, w10.objects.countries, (a, b) => a !== b);
  const lines = fullMesh.coordinates.filter((line) =>
    line.some(([x, y]) => x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3]),
  );

  const layers: RegionalLayers = {
    land: {
      type: 'FeatureCollection',
      features: polygons.map((geometry) => ({type: 'Feature', properties: {}, geometry})),
    },
    borders: {type: 'MultiLineString', coordinates: lines},
    polygonAt: (x, y) => polygons.find((p) => geoContains(p, [x, y])) ?? null,
  };
  regionalCache = {key, layers};
  return layers;
};
