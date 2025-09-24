/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import { Plugin } from 'ckeditor5';
import NVToolsUI from './nvtoolsui.js';

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
        return [NVToolsUI] as const;
    }
}
