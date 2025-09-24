/**
 * NukeViet NVDocs for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
    ButtonView,
    CssTransitionDisablerMixin,
    MenuBarMenuListItemButtonView,
    Plugin,
    Locale
} from 'ckeditor5';

import nvtoolsIcon from '../theme/icons/tools.svg';

import { NVToolsFormView } from './nvtoolsformview.js';

export default class NVToolsUI extends Plugin {
    private _formView: NVToolsFormView | undefined;

    /**
     * @inheritDoc
     */
    public static get pluginName() {
        return 'NVToolsUI' as const;
    }

    /**
     * @inheritDoc
     */
    // public static get requires() {
    //     return [NVDocsUtils] as const;
    // }

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
     * Thiết lập nút chèn nvdocs
     */
    private _createToolbarComponent(locale: Locale): ButtonView {
        const t = locale.t;
        const button = this._createDialogButton(ButtonView);

        button.tooltip = true;
        button.label = t('NVTools');
        return button;
    }

    /**
     * The form view displayed in the dialog.
     */
    private _showDialog() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const t = editor.locale.t;

        if (!this._formView) {
            this._formView = new (CssTransitionDisablerMixin(NVToolsFormView))(editor.locale);
        }

        dialog.show({
            id: 'nvtools',
            title: t('NVTools'),
            content: this._formView,
            isModal: true,
            onShow: () => {},
            actionButtons: [
                {
                    label: t('Cancel'),
                    withText: true,
                    onExecute: () => dialog.hide()
                }
            ]
        });
    }
}
