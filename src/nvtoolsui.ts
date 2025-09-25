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
    CssTransitionDisablerMixin,
    MenuBarMenuListItemButtonView,
    Plugin,
    Locale,
    SplitButtonView,
    UIModel
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
                name: 'btoh2'
			})
		});
		items.add({
			type: 'button',
			model: new UIModel({
				withText: true,
				label: t('Remove external links'),
                name: 'removeexternallinks'
			})
		});
        dropdownView.on('execute', (evt) => {
            const name = (evt.source as UIModel).name;
            if (name === 'btoh2') {
                this.editor.execute('b2h2');
            } else if (name === 'removeexternallinks') {
                this.editor.execute('removeExternalLinks');
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
            onShow: () => {},
            actionButtons: [
                {
                    label: t('Close'),
                    withText: true,
                    onExecute: () => dialog.hide()
                }
            ]
        });
    }
}
