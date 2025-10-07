/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
    addListToDropdown,
    ButtonView,
    createDropdown,
    Collection,
    FocusableView,
    type DropdownView,
    type ListDropdownItemDefinition,
    type Editor,
    CssTransitionDisablerMixin,
    MenuBarMenuListItemButtonView,
    ModelElement,
    Plugin,
    Locale,
    SplitButtonView,
    UIModel,
    ListView,
    SpinnerView,
    IconView,
    View,
    type ModelItem,
    type DialogActionButtonDefinition,
    Dialog
} from 'ckeditor5';

import nvtoolsIcon from '../theme/icons/tools.svg';
import b2h2Icon from '../theme/icons/b2h2.svg';
import removeLinkIcon from '../theme/icons/remove-link.svg';
import imageDownloadIcon from '../theme/icons/image-download.svg';
import waitIcon from '../theme/icons/hour-glass.svg';
import successIcon from '../theme/icons/check-circle-fill.svg';
import errorIcon from '../theme/icons/exclamation-triangle-fill.svg';

import { NVToolsFormView } from './nvtoolsformview.js';
import { NVToolsSaveExternalImageFormView } from './nvtoolssaveexternalimageformview.js';
import { ElementView } from './ElementView.js';

declare const nv_base_siteurl: string | undefined;

export default class NVToolsUI extends Plugin {

    private _formView: NVToolsFormView | undefined;

    private _formSaveExternalImageView: NVToolsSaveExternalImageFormView | undefined;

    private _saveExternalImageIsRun: boolean = false;
    private _saveExternalImageTimerRun: number = 0;
    private _saveExternalImageOffset: number = 0;
    private _images: ModelItem[] = [];
    private _imagesElement: ExternalImagesElementStatus[] = [];

    /**
     * @inheritDoc
     */
    public static get pluginName() {
        return 'NVToolsUI' as const;
    }

    /**
     * @inheritDoc
     */
    public init(): void {
        const editor = this.editor;
        const componentCreator = (locale: Locale) => this._createToolbarComponent(locale);
        editor.ui.componentFactory.add('nvtools', componentCreator);
    }

    /**
     * Creates a dialog button.
     * @param ButtonClass The button class to instantiate.
     * @returns The created button instance.
     */
    private _createDialogButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(ButtonClass: T): InstanceType<T> {
        const editor = this.editor;
        const buttonView = new ButtonClass(editor.locale) as InstanceType<T>;
        const dialogPlugin = this.editor.plugins.get('Dialog');

        buttonView.icon = nvtoolsIcon;

        buttonView.on('execute', () => {
            if (dialogPlugin.id === 'nvtools') {
                dialogPlugin.hide();
            } else {
                this._showDialog();
            }
        });

        return buttonView;
    }

    /**
     * Thiết lập nút nvtools trên thanh công cụ
     */
    private _createToolbarComponent(locale: Locale): DropdownView {
        const t = locale.t;
        const button = this._createDialogButton(ButtonView) as ButtonView & FocusableView;

        button.tooltip = true;
        button.label = t('Support toolkits');

        const dropdownButton = new SplitButtonView(locale, button);
        dropdownButton.tooltip = true;
        dropdownButton.label = t('Support toolkits');

        const dropdownView = createDropdown(locale, dropdownButton);
        const items = new Collection<ListDropdownItemDefinition>();

        items.add({
            type: 'button',
            model: new UIModel({
                withText: true,
                label: t('Convert b to h2 tag'),
                name: 'btoh2',
                icon: b2h2Icon
            })
        });
        items.add({
            type: 'button',
            model: new UIModel({
                withText: true,
                label: t('Remove external links'),
                name: 'removeexternallinks',
                icon: removeLinkIcon
            })
        });
        const uploadUrl = this.editor.config.get('simpleUpload.uploadUrl')!;
        if (!!uploadUrl) {
            items.add({
                type: 'button',
                model: new UIModel({
                    withText: true,
                    label: t('Save external image'),
                    name: 'saveexternalimage',
                    icon: imageDownloadIcon
                })
            });
        }
        dropdownView.on('execute', (evt) => {
            const name = (evt.source as UIModel).name;
            if (name === 'btoh2') {
                this.editor.execute('b2h2');
            } else if (name === 'removeexternallinks') {
                this.editor.execute('removeExternalLinks');
            } else if (name === 'saveexternalimage') {
                this.showDialogSaveExternalImage();
            }
        });

        addListToDropdown(dropdownView, items);
        return dropdownView;
    }

    /**
     * The form view displayed in the dialog.
     */
    private _showDialog() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const t = editor.locale.t;

        if (!this._formView) {
            this._formView = new (CssTransitionDisablerMixin(NVToolsFormView))(editor);
        }

        dialog.show({
            id: 'nvtools',
            title: t('Support toolkits'),
            content: this._formView,
            isModal: true,
            onShow: () => { },
            actionButtons: [
                {
                    label: t('Close'),
                    withText: true,
                    onExecute: () => dialog.hide()
                }
            ]
        });
    }

    /**
     * Hàm viết danh sách ảnh ngoài ra
     *
     * @param editor
     * @param images
     * @returns
     */
    private _listExternalImages(): ElementView[] {
        const locale = this.editor.locale;
        const t = locale.t;

        this._imagesElement = [];
        const images: ElementView[] = [];

        this._images.forEach(image => {
            const liView = new ElementView(locale);

            const col1View = new ElementView(locale);
            const col2View = new ElementView(locale);
            const col3View = new ElementView(locale);

            const imgShowView = new ElementView(locale);
            const imgBgView = new ElementView(locale);
            const srcView = new ElementView(locale);
            const altView = new ElementView(locale);

            const statusWaitView = new IconView();
            const statusSuccessView = new IconView();
            const statusProcessingView = new SpinnerView();
            const statusErrorView = new IconView();

            const alt: string = (image.hasAttribute('alt') ? (image.getAttribute('alt') as string) : '').trim();

            imgShowView.setTemplate({
                tag: 'img',
                attributes: {
                    src: image.getAttribute('src') as string,
                    alt: alt,
                    class: ['ck-nvtools-external-image-thumb-show']
                }
            });
            imgBgView.setTemplate({
                tag: 'img',
                attributes: {
                    src: image.getAttribute('src') as string,
                    alt: alt,
                    class: ['ck-nvtools-external-image-thumb-bg'],
                    style: {
                        backgroundImage: `url(${image.getAttribute('src')})`
                    }
                }
            });
            srcView.setTemplate({
                tag: 'div',
                children: [image.getAttribute('src') as string],
                attributes: {
                    class: ['ck-nvtools-external-image-src']
                }
            });

            if (!!alt) {
                altView.setTemplate({
                    tag: 'div',
                    children: [alt],
                    attributes: {
                        class: ['ck-nvtools-external-image-alt']
                    }
                });
            } else {
                altView.setTemplate({
                    tag: 'div',
                    children: ['No alt text'],
                    attributes: {
                        class: ['ck-nvtools-external-image-alt-none']
                    }
                });
            }

            statusWaitView.content = waitIcon;
            statusSuccessView.content = successIcon;
            statusSuccessView.extendTemplate({
                attributes: {
                    class: ['ck-nvtools-icon-success']
                }
            });
            statusErrorView.content = errorIcon;
            statusErrorView.extendTemplate({
                attributes: {
                    class: ['ck-nvtools-icon-error']
                }
            });

            statusProcessingView.isVisible = false;
            statusWaitView.isVisible = true;
            statusSuccessView.isVisible = false;
            statusErrorView.isVisible = false;

            col1View.setTemplate({
                tag: 'div',
                children: [imgBgView, imgShowView],
                attributes: {
                    class: ['ck-nvtools-external-image-thumb']
                }
            });
            col2View.setTemplate({
                tag: 'div',
                children: [srcView, altView],
                attributes: {
                    class: ['ck-nvtools-external-image-info']
                }
            });
            col3View.setTemplate({
                tag: 'div',
                children: [statusProcessingView, statusWaitView, statusSuccessView, statusErrorView],
                attributes: {
                    class: ['ck-nvtools-external-image-status']
                }
            });

            liView.setTemplate({
                tag: 'li',
                children: [col1View, col2View, col3View],
                attributes: {
                    class: ['ck-nvtools-external-image-item']
                }
            });
            this._imagesElement.push({
                wait: statusWaitView,
                success: statusSuccessView,
                processing: statusProcessingView,
                error: statusErrorView,
                imageUrl: image.getAttribute('src') as string,
                imageAlt: alt,
                statusContainer: col3View,
                completed: false
            });
            images.push(liView);
        });
        return images;
    }

    /**
     * Lấy đường dẫn thư mục chứa file
     * @param p Đường dẫn file
     * @returns Đường dẫn thư mục
     */
    private _dirname(p: string): string {
        const i = p.lastIndexOf("/");
        if (i === -1) return "/";
        if (i === 0) return "/";
        return p.slice(0, i);
    }

    /**
     * Cập nhật đường dẫn upload
     *
     * @param url Đường dẫn upload
     * @param newPath Đường dẫn mới
     * @returns Đường dẫn upload đã được cập nhật
     */
    private _updateUploadUrl(url: string, newPath: string): string {
        // Nếu là NukeViet, xử lý biến newPath
        if (typeof nv_base_siteurl !== 'undefined' && newPath.startsWith(nv_base_siteurl)) {
            newPath = '/' + newPath.slice(nv_base_siteurl.length);
        }
        newPath = this._dirname(newPath);

        const base = window.location.origin;
        const u = new URL(url, base);

        if (u.searchParams.has('path')) {
            // Nếu có sẵn path thì đổi giá trị
            u.searchParams.set('path', newPath);
        } else {
            // Nếu chưa có path thì thêm
            u.searchParams.append('path', newPath);
        }

        // Trả về lại chuỗi, bỏ base đi
        return u.pathname + "?" + u.searchParams.toString();
    }

    /**
     * Hàm upload ảnh từ url
     *
     * @param imageUrl Đường dẫn ảnh
     * @param imageAlt Chú thích ảnh
     * @returns
     */
    private _uploadRemote(imageUrl: string, imageAlt: string): Promise<UploadResponse> {
        return new Promise((resolve, reject) => {
            const uploadConfig = this.editor.config.get('simpleUpload')!;
            if (!uploadConfig.uploadUrl) {
                reject('The uploadUrl configuration is not set.');
            }

            const path: string | undefined = this._formSaveExternalImageView?.path;
            const alt: string | undefined = this._formSaveExternalImageView?.alt;
            const prefix: string | undefined = this._formSaveExternalImageView?.prefix;
            // const altOnly: boolean | undefined = this._formSaveExternalImageView?.altOnly;

            const postUrl = this._updateUploadUrl(uploadConfig.uploadUrl, path as string);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', postUrl, true);
            xhr.responseType = 'json';

            const genericErrorText = 'Couldn\'t upload file:' + ` ${imageUrl}.`;

            xhr.addEventListener('error', () => reject(genericErrorText));
            xhr.addEventListener('abort', () => reject());
            xhr.addEventListener('load', () => {
                const response = xhr.response;

                if (!response || response.error) {
                    return reject(response && response.error && response.error.message ? response.error.message : genericErrorText);
                }
                const urls = response.url ? { default: response.url } : response.urls;
                resolve({
                    ...response,
                    urls
                });
            });

            let headers = (uploadConfig.headers || {}) as Record<string, string>;
            const withCredentials = uploadConfig.withCredentials || false;
            for (const headerName of Object.keys(headers)) {
                xhr.setRequestHeader(headerName, headers[headerName]);
            }
            xhr.withCredentials = withCredentials;
            const data = new FormData();
            data.append('fileurl', imageUrl);
            if (!!alt) {
                data.append('filealt', alt);
            }
            if (!!prefix) {
                data.append('newfilename', prefix);
            }
            xhr.send(data);
        });
    }

    /**
     * Hàm xử lý chạy lưu ảnh ngoài
     * @returns void
     */
    private async _saveExternalImageRun(): Promise<void> {
        const editor = this.editor;
        if (!this._saveExternalImageIsRun) return;

        const index = this._saveExternalImageOffset;
        const imageStatus: ExternalImagesElementStatus = this._imagesElement[index];
        const image = this._images[index] as ModelElement;

        this._saveExternalImageOffset++;
        let timerAmount = 0;

        if (!imageStatus.completed) {
            timerAmount = 500;

            // Loader show
            imageStatus.wait.isVisible = false;
            imageStatus.error.isVisible = false;
            imageStatus.processing.isVisible = true;
            imageStatus.statusContainer.element!.removeAttribute('title');

            const alt: string | undefined = this._formSaveExternalImageView?.alt;
            const altOnly: boolean | undefined = this._formSaveExternalImageView?.altOnly;

            try {
                const uploadInfo = await this._uploadRemote(imageStatus.imageUrl, imageStatus.imageAlt);
                editor.model.change(writer => {
                    writer.setAttribute('src', uploadInfo.url, image);

                    // Thay đổi alt nếu có chọn và có alt
                    if (!!alt && (!altOnly || (altOnly && !imageStatus.imageAlt.length))) {
                        writer.setAttribute('alt', `${alt} ${index}`, image);
                    }
                });
                imageStatus.processing.isVisible = false;
                imageStatus.success.isVisible = true;

                // Đánh dấu ảnh này đã hoàn thành
                imageStatus.completed = true;
                this._imagesElement[index].completed = true;
            } catch (error) {
                // XMLHttpRequest reject nên lỗi gì sẽ vào đây kể cả lỗi từ server trả về
                imageStatus.processing.isVisible = false;
                imageStatus.error.isVisible = true;
                imageStatus.statusContainer.element!.setAttribute('title', (error as string) || 'Error uploading image');
            }
        } else {
            // Nếu ảnh đã hoàn thành thì không làm gì cả
            timerAmount = 1;
        }

        // Tiếp tục xử lý ảnh kế tiếp sau timerAmount
        if (this._saveExternalImageOffset < this._imagesElement.length) {
            this._saveExternalImageTimerRun = setTimeout(() => {
                this._saveExternalImageRun();
            }, timerAmount);
            return;
        }

        // Đã chạy qua tất cả các ảnh
        this._saveExternalImageIsRun = false;
        const dialog: Dialog = editor.plugins.get('Dialog');
        const submitButton = dialog.view?.actionsView?.children.get(0) as ButtonView;
        const t = editor.locale.t;

        const imgCompleted = this._imagesElement.filter(i => i.completed).length;
        if (imgCompleted === this._imagesElement.length) {
            submitButton.label = t('Complete');
        } else {
            submitButton.label = t('Retry');
        }
        this._formSaveExternalImageView!.enableForm();
    }

    /**
     * Hiển thị dialog lấy ảnh về máy chủ
     */
    public showDialogSaveExternalImage() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const t = editor.locale.t;

        if (!this._formSaveExternalImageView) {
            this._formSaveExternalImageView = new (CssTransitionDisablerMixin(NVToolsSaveExternalImageFormView))(getFormSaveImgValidators(this.editor), this.editor);
        }

        this._images = [];

        // Xử lý tìm ảnh ngoài
        editor.model.change(writer => {
            const root = editor.model.document.getRoot() as ModelElement;
            const range = writer.createRangeIn(root);

            for (const item of range.getItems()) {
                if (item.is('element', 'imageInline') || item.is('element', 'imageBlock')) {
                    const src = item.getAttribute('src') as string;
                    if (!src) continue;
                    // Không xử lý ảnh relative
                    if (src.startsWith('/') && !src.startsWith('//')) {
                        continue;
                    }
                    // Không xử lý ảnh nội bộ
                    if (src.toLowerCase().startsWith(window.location.origin.toLowerCase())) {
                        continue;
                    }

                    this._images.push(item);
                }
            }
        });

        const actionButtons: DialogActionButtonDefinition[] = [];
        if (this._images.length > 0) {
            actionButtons.push({
                label: t('Submit'),
                class: 'ck-button-action',
                withText: true,
                onExecute: () => {
                    // Đang chạy thì thôi
                    if (this._saveExternalImageIsRun) return;

                    // Đã hoàn thành rồi thì đóng Dialog
                    const submitButton = dialog.view?.actionsView?.children.get(0) as ButtonView;
                    if (submitButton.label === t('Complete')) {
                        dialog.hide();
                        return;
                    }

                    // Check form hợp lệ thì bắt đầu
                    if (this._formSaveExternalImageView!.isValid()) {
                        this._formSaveExternalImageView!.disableForm();
                        this._saveExternalImageIsRun = true;
                        this._saveExternalImageOffset = 0;
                        this._saveExternalImageRun();
                    }
                }
            });
        }
        actionButtons.push({
            label: t('Close'),
            withText: true,
            onExecute: () => dialog.hide()
        });

        dialog.show({
            id: 'nvtoolsSaveExternalImage',
            title: t('Save external image'),
            content: this._formSaveExternalImageView,
            isModal: true,
            onShow: (dlg: Dialog) => {
                dlg.view?.element?.classList.add('ck-nvtools-dialog', 'ck-nvtools-save-external-image');

                this._formSaveExternalImageView!.enableForm();
                this._formSaveExternalImageView!.focus();

                // Xử lý nội dung
                const dataView = this._formSaveExternalImageView!.dataView;
                dataView.children.clear();

                if (this._images.length == 0) {
                    const textView = new View(editor.locale);
                    textView.setTemplate({
                        tag: 'span',
                        attributes: {
                            class: 'ck-nvtools-text-success'
                        },
                        children: [t('Good, there are no external images in the content being edited.')]
                    });
                    dataView.children.add(textView);
                } else {
                    const listView = new ListView(editor.locale);
                    listView.items.addMany(this._listExternalImages());
                    listView.extendTemplate({
                        attributes: {
                            class: ['ck-nvtools-external-image-list']
                        }
                    });
                    dataView.children.add(listView);
                }
            },
            actionButtons: actionButtons,
            onHide: () => {
                this._saveExternalImageIsRun = true;
                if (this._saveExternalImageTimerRun) {
                    window.clearTimeout(this._saveExternalImageTimerRun);
                    this._saveExternalImageTimerRun = 0;
                }
            }
        });
    }

    /**
     * Đặt đường dẫn lưu ảnh ngoài vào dialog
     *
     * @param path
     */
    public setExternalImagePath(path: string) {
        if (this._formSaveExternalImageView) {
            this._formSaveExternalImageView.path = path;
            this._formSaveExternalImageView.resetFormStatus();
        }
    }
}

/**
 * Các hàm kiểm tra tính hợp lệ của form tải ảnh về máy chủ
 *
 * @param t
 * @returns
 */
function getFormSaveImgValidators(editor: Editor): Array<(v: NVToolsSaveExternalImageFormView) => boolean> {
    const t = editor.locale.t;

    return [
        // Kiểm tra path
        form => {
            // Không trống
            if (!form.pathInputValue.length) {
                form.pathInputView.errorText = t('The path must not be empty.');
                return false;
            }
            // Phải bắt đầu bằng / và kết thúc dạng .ext, chỉ chứa các ký tự a-z, A-Z, 0-9, -, _, /, .
            if (!form.pathInputValue.match(/^\/[a-zA-Z0-9\-_/\.]+(\.[a-zA-Z0-9]+)+$/)) {
                form.pathInputView.errorText = t('Invalid file path');
                return false;
            }
            // Không được chứa //
            if (form.pathInputValue.indexOf('//') >= 0) {
                form.pathInputView.errorText = t('Invalid file path');
                return false;
            }
            return true;
        }
    ];
}

type ExternalImagesElementStatus = {
    wait: IconView;
    success: IconView;
    processing: SpinnerView;
    error: IconView;
    imageUrl: string;
    imageAlt: string;
    statusContainer: ElementView;
    completed: boolean;
};

type UploadResponse = {
    url?: string;
    error?: {
        message: string;
    };
};
