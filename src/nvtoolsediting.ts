/**
 * NukeViet NVTools for CKEditor5
 * @version 4.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2024 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

/* globals window */

import { Plugin } from 'ckeditor5/src/core.js';

export default class NVToolsEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'NVToolsEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Xử lý xóa rỗng thẻ <p>&nbsp;</p>
		const emptyParagraphRegexp = /(^|<body\b[^>]*>)\s*<(p|div|address|h\d|center|pre)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;)?\s*(:?<\/\2>)?\s*(?=$|<\/body>)/gi;

		const originalGetData = editor.getData;
		editor.getData = function () {
			let data = originalGetData.apply(this);
			data = data.replace(emptyParagraphRegexp, function (match, lookback) {
				return lookback;
			});
			return data;
		};
	}
}
