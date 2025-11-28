/**
 * NukeViet NVBox for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import type { Editor } from "ckeditor5";

/**
 * @module nvbox/nvconfig
 */

/**
 * ```
 * ClassicEditor
 * 	.create( editorElement, {
 * 		nukeviet: {
 * 			editorId: 'ABCD',
*           height: '300px'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 */
export interface NVConfig {
    /*
     * ID của trình soạn thảo, nếu không truyền sẽ tạo ngẫu nhiên
     */
    editorId?: string;

    /**
     * Chiều cao của trình soạn thảo, nếu để trống thì chiều cao tự động điều chỉnh theo nội dung
     */
    height?: string | number;

    /**
     * Cập nhật nội dung của thẻ textarea khi submit form
     * Nếu không phải gọi getData() để lấy dữ liệu
     */
    updateOnSubmit?: boolean;

    /**
     * Hàm callback được gọi sau khi khởi tạo trình soạn thảo thành công
     * Kiểu dữ liệu có thể là tên hàm (string) hoặc hàm (function)
     */
    initCallback?: string | ((editor: Editor) => void);
}
