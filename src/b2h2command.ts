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

export default class B2H2Command extends Command {
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
     * Thực thi lệnh đổi thẻ b (strong) thành h2
     */
    public override execute(): void {
        const editor = this.editor;
        const t = editor.t!;
        let countItems = 0;
        editor.model.change(writer => {
            const root = editor.model.document.getRoot() as ModelElement;
            const range = writer.createRangeIn(root);

            // Thu thập các paragraph cần chuyển
            const blocksToConvert = new Set<ModelElement>();
            for (const item of range.getItems()) {
                if ((item.is('$textProxy') || item.is('$text')) && item.hasAttribute('bold')) {
                    const block = item.parent!;
                    if (block && block.is('element', 'paragraph')) {
                        blocksToConvert.add(block);
                    }
                }
            }

            // Chuyển và xóa attribute bold bên trong block đó
            for (const block of blocksToConvert) {
                writer.rename(block, 'heading2');
                countItems++;

                // Duyệt tất cả text node trong block (bây giờ là heading2) và remove bold
                const innerRange = writer.createRangeIn(block);
                for (const node of innerRange.getItems()) {
                    if ((node.is('$textProxy') || node.is('$text')) && node.hasAttribute('bold')) {
                        writer.removeAttribute('bold', node);
                    }
                }
            }
        });

        const notification: Notification = editor.plugins.get( 'Notification' );
        setTimeout(() => {
            if (countItems) {
                notification.showWarning(t('Converted %0 b tags to h2', countItems.toString()));
            } else {
                notification.showWarning(t('There is no b tag in the content being edited'));
            }
        }, 10);

    }
}
