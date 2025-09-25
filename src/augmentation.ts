/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import type {
	NVTools,
	NVToolsUI,
	B2H2Command,
	RemoveExternalLinksCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	// Khai báo các plugin
	interface PluginsMap {
		[NVTools.pluginName]: NVTools;
		[NVToolsUI.pluginName]: NVToolsUI;
	}

	// Khai báo các command
	interface CommandsMap {
		b2h2: B2H2Command;
		removeExternalLinks: RemoveExternalLinksCommand;
	}
}
