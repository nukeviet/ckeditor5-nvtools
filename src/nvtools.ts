/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
    Plugin,
    type Dialog
 } from 'ckeditor5';
import NVToolsUI from './nvtoolsui.js';
import NVToolsCore from './nvtoolscore.js';
import B2H2Command from './b2h2command.js';
import RemoveExternalLinksCommand from './removeexternallinkscommand.js';

export default class NVTools extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'NVTools' as const;
    }

    /**
     * @inheritDoc
     */
    static get requires() {
        return [NVToolsUI, NVToolsCore] as const;
    }

    /**
     * @inheritDoc
     */
    public init(): void {
        const editor = this.editor;

        editor.commands.add('b2h2', new B2H2Command(editor));
        editor.commands.add('removeExternalLinks', new RemoveExternalLinksCommand(editor));

        /**
         * Lắng nghe sự kiện đóng mở dialog để xử lý tích hợp với NukeViet
         */
        const dialog: Dialog = editor.plugins.get('Dialog');
        dialog.on('show', () => {
            document.documentElement.classList.add('ck-dialog-opened');
        });
        dialog.on('hide', () => {
            document.documentElement.classList.remove('ck-dialog-opened');
        });

        // Cho phép thẻ <b> trong schema
        // editor.model.schema.register('b', {
        //     allowWhere: '$text',
        //     allowContentOf: '$block',
        //     isInline: true,
        //     isObject: false,
        // });
        // editor.conversion.elementToElement({
        //     view: 'b',
        //     model: 'b'
        // });
        // editor.conversion.elementToElement({
        //     model: 'b',
        //     view: 'b'
        // });
        // Mặc định b upcast thành strong
    }
}
