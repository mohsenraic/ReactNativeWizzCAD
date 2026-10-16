import { Config } from '@remotion/cli/config';
import { makeWebpackOverride } from '../shared/remotion/webpack-override.mjs';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
// Compile ../shared against this project's node_modules (run the CLI from this folder).
Config.overrideWebpackConfig(makeWebpackOverride(process.cwd()));
