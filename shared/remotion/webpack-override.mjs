/**
 * webpack-override.mjs — lets a video project compile files from ../shared.
 *
 * shared/ has no node_modules of its own. Webpack normally resolves packages by walking up from the
 * importing file, which from shared/ would miss the project's node_modules (or hit an unrelated one
 * higher up). Putting the project's node_modules first makes every import — from the project or from
 * shared/ — resolve to one copy of react, remotion, d3-geo, etc.
 *
 * Used by each project's remotion.config.ts (CLI / Studio) and by scripts that call bundle() directly.
 *
 * @example
 * // remotion.config.ts
 * import { makeWebpackOverride } from '../shared/remotion/webpack-override.mjs';
 * Config.overrideWebpackConfig(makeWebpackOverride(process.cwd()));
 */
import path from 'node:path';

/** @param {string} projectRoot absolute path of the video project (the folder with package.json) */
export const makeWebpackOverride = (projectRoot) => (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    modules: [path.join(projectRoot, 'node_modules'), 'node_modules'],
  },
});
