/**
 * NukeViet NVTools for CKEditor5
 * @version 4.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2024 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import type {
	NVTools,
	NVToolsEditing,
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[NVTools.pluginName]: NVTools;
		[NVToolsEditing.pluginName]: NVToolsEditing;
	}
}
