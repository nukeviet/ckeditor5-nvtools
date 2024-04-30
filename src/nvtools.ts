/**
 * NukeViet NVTools for CKEditor5
 * @version 4.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2024 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import { Plugin } from 'ckeditor5/src/core.js';
import NVToolsEditing from './nvtoolsediting.js';

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
        return [NVToolsEditing] as const;
    }
}
