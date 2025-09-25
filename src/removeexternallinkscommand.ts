/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import { Command, type Editor } from 'ckeditor5';

export default class RemoveExternalLinksCommand extends Command {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor) {
        super(editor);
    }

    /**
     * @inheritDoc
     */
    public override refresh(): void {
        this.isEnabled = true;
    }

    /**
	 * Thực thi lệnh xóa liên kết ngoài
	 */
    public override execute(): void {
        const editor = this.editor;
        console.log('Remove external links command executed');
    }
}
