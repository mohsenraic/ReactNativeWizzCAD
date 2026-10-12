import {geoOrthographic, GeoProjection} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry, MultiLineString} from 'geojson';
import {feature, mesh} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
// 50m = bon compromis détail / vitesse. Remplacer par 'countries-10m.json'
// pour des frontières plus fines sur les très gros zooms (rendu plus lent).
import worldData from 'world-atlas/countries-50m.json';
import {Camera, MAP, VIDEO} from '../config';

type Props = {name: string};

const world = worldData as unknown as Topology<{
  countries: GeometryCollection<Props>;
  land: GeometryCollection;
}>;

export const countries = feature(world, world.objects.countries) as FeatureCollection<
  Geometry,
  Props
>;

export const land = feature(world, world.objects.land) as FeatureCollection;

/** Frontières intérieures uniquement (pas les côtes) */
export const borders: MultiLineString = mesh(
  world,
  world.objects.countries,
  (a, b) => a !== b,
);

export const getCountry = (isoNumeric: string): Feature<Geometry, Props> | undefined =>
  countries.features.find((f) => String(f.id) === isoNumeric);

export const makeProjection = (camera: Camera): GeoProjection =>
  geoOrthographic()
    .scale(camera.scale)
    .translate([VIDEO.width / 2, MAP.centerY])
    .rotate([-camera.lon, -camera.lat, 0])
    .clipAngle(90)
    .precision(0.6);

/** Interpolation de caméra : position linéaire, échelle logarithmique (zoom perçu constant) */
export const lerpCamera = (a: Camera, b: Camera, p: number): Camera => ({
  lon: a.lon + (b.lon - a.lon) * p,
  lat: a.lat + (b.lat - a.lat) * p,
  scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * p),
});
