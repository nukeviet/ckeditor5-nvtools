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

export default class NVToolsUI extends Plugin {
    private _formView: NVToolsFormView | undefined;

    private _formSaveExternalImageView: NVToolsSaveExternalImageFormView | undefined;

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
     * Hiển thị dialog lấy ảnh về máy chủ
     */
    public showDialogSaveExternalImage() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const t = editor.locale.t;

        if (!this._formSaveExternalImageView) {
            this._formSaveExternalImageView = new (CssTransitionDisablerMixin(NVToolsSaveExternalImageFormView))(getFormSaveImgValidators(this.editor), this.editor);
        }

        const images: ModelItem[] = [];

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

                    images.push(item);
                }
            }
        });

        const actionButtons: DialogActionButtonDefinition[] = [];
        if (images.length > 0) {
            actionButtons.push({
                label: t('Submit'),
                class: 'ck-button-action',
                withText: true,
                onExecute: () => {
                    if (this._formSaveExternalImageView!.isValid()) {
                        //
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

                this._formSaveExternalImageView!.focus();

                // Xử lý nội dung
                const dataView = this._formSaveExternalImageView!.dataView;
                dataView.children.clear();

                if (images.length == 0) {
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
                    listView.items.addMany(listExternalImages(editor, images));
                    listView.extendTemplate({
                        attributes: {
                            class: ['ck-nvtools-external-image-list']
                        }
                    });
                    dataView.children.add(listView);
                }
            },
            actionButtons: actionButtons
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
        }
    }
}

/**
 * Hàm viết danh sách ảnh ngoài ra
 *
 * @param editor
 * @param images
 * @returns
 */
function listExternalImages(editor: Editor, images: ModelItem[]): ElementView[] {
    const locale = editor.locale;
    const t = locale.t;

    const items: ElementView[] = [];
    images.forEach(image => {
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
        items.push(liView);
    });
    return items;
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
