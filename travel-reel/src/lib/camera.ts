import {Easing} from 'remotion';
import {DATA} from '../data';
import type {Camera} from '../data/types';
import {progress} from './anim';
import {lerpCamera} from './geo';
import type {Timeline} from './timeline';

/**
 * Map camera over time:
 * rotation (Atlantic -> country) -> zoom on the coast -> slow push ->
 * optional detail framing (e.g. Corfu) -> fast zoom on the place -> reveal.
 */
export const cameraAt = (t: number, tl: Timeline): Camera => {
  const g = DATA.globe;
  if (t <= tl.zoomEnd) {
    const rot = progress(t, tl.globeStart - 0.2, tl.zoomStart + 0.25);
    const zoom = progress(t, tl.zoomStart, tl.zoomEnd);
    return zoom > 0 ? lerpCamera(g.country, g.zoomTo, zoom) : lerpCamera(g.from, g.country, rot);
  }

  // Slow push so the map never stands still
  const settled: Camera = {...g.zoomTo, scale: g.zoomTo.scale * 1.35};
  const detailStart = tl.detailAt !== null ? tl.detailAt - 0.6 : tl.zoomInStart;
  let cam = lerpCamera(g.zoomTo, settled, progress(t, tl.zoomEnd, detailStart, Easing.out(Easing.quad)));

  if (g.detail && tl.detailAt !== null) {
    cam = lerpCamera(cam, g.detail.camera, progress(t, detailStart, tl.detailAt + 0.9));
  }

  // Fast zoom on the place, accelerating into the reveal
  const target: Camera = {lon: DATA.place.lon, lat: DATA.place.lat, scale: g.revealScale};
  const z = progress(t, tl.zoomInStart, tl.revealEnd, Easing.in(Easing.cubic));
  return z > 0 ? lerpCamera(cam, target, z) : cam;
};
