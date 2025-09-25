/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
    Command,
    type Editor,
    type ModelElement,
    type Notification
} from 'ckeditor5';

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
        const t = editor.t!;
        let countItems = 0;
        editor.model.change(writer => {
            const root = editor.model.document.getRoot() as ModelElement;
            const range = writer.createRangeIn(root);

            for (const item of range.getItems()) {
                if ((item.is('$text') || item.is('$textProxy')) && item.hasAttribute('linkHref') && item.hasAttribute('htmlA')) {
                    const linkHref = item.getAttribute('linkHref') as string;
                    // Không xử lý anchor link
                    if (linkHref.startsWith('#')) {
                        continue;
                    }
                    // Không xử lý relative link
                    if (linkHref.startsWith('/') && !linkHref.startsWith('//')) {
                        continue;
                    }
                    // Không xử lý link nội bộ
                    if (linkHref.startsWith(window.location.origin)) {
                        continue;
                    }
                    countItems++;
                    writer.removeAttribute('linkHref', item);
                    writer.removeAttribute('htmlA', item);
                }
            }
        });
        const notification: Notification = editor.plugins.get( 'Notification' );
        setTimeout(() => {
            if (countItems) {
                notification.showWarning(t('%0 external links have been removed', countItems.toString()));
            } else {
                notification.showWarning(t('There are no external links in the editing content'));
            }
        }, 10);
    }
}
