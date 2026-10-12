import {geoOrthographic, GeoProjection} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry, MultiLineString} from 'geojson';
import {feature, mesh} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import worldData from 'world-atlas/countries-50m.json';
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
