# Real scaled Solar system simulator

# Implementation Notes
  * `src/@` folder contains external dependencies as ES6 modules, so they can be easily imported using absolute path like `'/@/preact.mjs'`
  ## TO DO
  ### 1) `\src\utils\pelems.mjs`
   In future `\src\utils\pelems.mjs` should be moved to dependencies as soon as I get rid of `import { createElement } from '/@/preact.mjs';`. It is managed in `https://github.com/rv4Flyver/rv4Preact`