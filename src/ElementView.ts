/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
    View,
    ViewCollection,
    type Locale
} from 'ckeditor5';

export class ElementView extends View {
    public children: ViewCollection;

    constructor(locale: Locale) {
        super(locale);
        this.children = this.createCollection();
        this.setTemplate({
            tag: 'div',
            children: this.children
        });
    }
}
