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
    type ClassicEditor,
    type Editor
} from 'ckeditor5';

import type { NVConfig } from './index.js';

declare global {
    interface Window {
        nveditor?: any;
    }
}

export default class NVToolsCore extends Plugin {
    private editorId: string = '';
    private updateOnSubmit: boolean = true;

    /**
     * @inheritDoc
     */
    public static get pluginName() {
        return 'NVToolsCore' as const;
    }

    /**
     * @inheritDoc
     */
    public init(): void {
        const editor: Editor = this.editor;
        const config: NVConfig | undefined = editor.config.get('nukeviet');

        if (config && typeof config?.editorId !== 'undefined' && !!config?.editorId) {
            this.editorId = config.editorId;
        } else {
            this.editorId = 'editor' + randomString(8);
        }
        if (config && typeof config?.updateOnSubmit !== 'undefined') {
            this.updateOnSubmit = config.updateOnSubmit;
        }
        if (config && config?.height) {
            const height = config.height;
            const style = document.createElement('style');
            style.id = 'nv-ckeditor5-style-' + this.editorId;
            style.textContent = `
            #outer_${this.editorId} .ck-editor__editable_inline {
                height: ${height};
                overflow-y: auto;
            }
            #outer_${this.editorId} .ck-source-editing-area {
                height: ${height};
            }
            #outer_${this.editorId} .ck-source-editing-area textarea {
                height: 100%;
                overflow-y: auto;
            }`;
            document.head.appendChild(style);
        }
    }

    /**
     * @inheritDoc
     */
    public afterInit(): void {
        const editor = this.editor as ClassicEditor;
        const editorId = this.editorId;
        const updateOnSubmit = this.updateOnSubmit;

        window.nveditor = window.nveditor || [];
        window.nveditor[editorId] = editor;

        const source = editor.sourceElement || null;

        // Cập nhật nội dung của thẻ textarea khi submit form
        if (updateOnSubmit && source && source instanceof HTMLTextAreaElement && source.form) {
            source.dataset.editorname = editorId;
            source.form.addEventListener("submit", () => {
                source.value = editor.getData();
            });
        }
    }
}

/**
 * Tạo chuỗi ngẫu nhiên
 *
 * @param length Độ dài chuỗi ngẫu nhiên
 * @returns Chuỗi ngẫu nhiên
 */
function randomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}
