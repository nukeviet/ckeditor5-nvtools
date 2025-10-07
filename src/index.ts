/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

/**
 * @module nvtools
 */

export { default as NVTools } from './nvtools.js';
export { default as NVToolsUI } from './nvtoolsui.js';
export { default as NVToolsCore } from './nvtoolscore.js';

export type { NVConfig } from './nvconfig.js';

export type { default as B2H2Command } from './b2h2command.js';
export type { default as RemoveExternalLinksCommand } from './removeexternallinkscommand.js';

import './augmentation.js';
