import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Le rendu SVG de la carte est un peu lourd : on limite la concurrence
// si la machine manque de RAM (ex. Config.setConcurrency(4)).
