# Real scaled Solar system simulator

### init-system.js
  Initializes `scene`, adds `planets` and creates `stars`.
  > exports {data,scene,sun,venus,mercury}

### init-overlay.js
  Creates labels for objects, handles DOM UI elements refs and provides helper functions `updateLabelsPos`, `updateCameraStats`
  > exports `setupOverlay` which returns  {panel, updateLabelsPos, updateCameraStats}

### init-display.js
  > imports { setupOverlay } from './init-overlay.js';
  
  getElementById('canvas-wrapper')
  
  > exports `setupDisplay` which creates `renderer`, `camera` and `overlay`

### solar.js
  > import FlyControls from '/utils/fly-controls.js';
  > imports {data,sun,mercury,venus,scene} from './init-system.js';
  > imports { setupDisplay } from './init-display.js';

  1) setupsDisplay using imported {scene, data} from init-system.js
  2) initializes FlyControls using display instance provided by `setupsDisplay` 
  3) contains `animationLoop` where do `updateLabelsPos`, `updateCameraStats`, `controls.update` and actual `renders`

# Implementation Notes
  * `src/@` folder contains external dependencies as ES6 modules, so they can be easily imported using absolute path like `'/@/preact.mjs'`
  ## TO DO
  ### 1) `\src\utils\pelems.mjs`
   In future `\src\utils\pelems.mjs` should be moved to dependencies as soon as I get rid of `import { createElement } from '/@/preact.mjs';`. It is managed in `https://github.com/rv4Flyver/rv4Preact`