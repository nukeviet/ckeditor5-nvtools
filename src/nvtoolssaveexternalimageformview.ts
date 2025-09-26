/**
 * NukeViet NVTools for CKEditor5
 * @version 5.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2025 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

import {
	ButtonView,
	createLabeledInputText,
	FormRowView,
	View,
	type Editor,
	LabeledFieldView,
	type InputTextView,
	SwitchButtonView,
	submitHandler
} from 'ckeditor5';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';

import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/nvtoolssaveimage.css';

/**
 * The nvtools form view controller class.
 */
export class NVToolsSaveExternalImageFormView extends View {
	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Giá trị của ô URL path lưu ảnh
	 */
	declare public pathInputValue: string;

	/**
	 * Giá trị của ô alt text
	 */
	declare public altInputValue: string;

	/**
	 * Giá trị của checkbox chỉ cập nhật ảnh không có alt
	 */
	declare public updateNoAltOnlyCheckboxValue: boolean;

	/**
	 * Giá trị của ô prefix tên file ảnh
	 */
	declare public namePrefixInputValue: string;

	/**
	 * Ô nhập hoặc chọn path lưu ảnh
	 */
	public pathInputView: LabeledFieldView<InputTextView>;

	/**
	 * Nút duyệt chọn path lưu ảnh
	 */
	public browseButtonView: LabeledFieldView<ButtonView>;

	/**
	 * Ô nhập alt text cho ảnh
	 */
	public altInputView: LabeledFieldView<InputTextView>;

	/**
	 * Nút chuyển chỉ cập nhật ảnh không có alt
	 */
	public updateNoAltOnlySwitchView: SwitchButtonView;

	public dataView: FormRowView;

	/**
	 * Ô nhập prefix tên file ảnh
	 */
	public namePrefixInputView: LabeledFieldView<InputTextView>;

	/**
	 * The editor instance.
	 */
	private editor: Editor;

	/**
	 * Mô tả mặc định của ô path lưu ảnh
	 */
	private _pathInputViewDefault?: string;

	/**
	 * Mô tả mặc định của ô prefix tên file ảnh
	 */
	private _prefixInputViewDefault?: string;

	/**
	 * Mảng các hàm kiểm tra tính hợp lệ của form
	 */
	private readonly _validators: Array<(v: NVToolsSaveExternalImageFormView) => boolean>;

	/**
	 * @param locale
	 */
	constructor(validators: Array<(v: NVToolsSaveExternalImageFormView) => boolean>, editor: Editor) {
		const t = editor.locale.t!;

		super(editor.locale);
		this._validators = validators;

		this.editor = editor;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set('pathInputValue', '');
		this.set('altInputValue', '');
		this.set('updateNoAltOnlyCheckboxValue', true);
		this.set('namePrefixInputValue', '');

		this.pathInputView = this._createPathInput();
		this.browseButtonView = this._createBrowseButton();
		this.altInputView = this._createAltInput();
		this.updateNoAltOnlySwitchView = this._createUpdateNoAltOnlySwitch();
		this.namePrefixInputView = this._createNamePrefixInput();

		// Dòng nhập path + nút browse
		const row1 = new FormRowView(editor.locale);
		row1.children.add(this.pathInputView);
		row1.children.add(this.browseButtonView);
		row1.class.push('ck-nvtools-form__row_column');

		const row2 = new FormRowView(editor.locale);
		row2.children.add(this.altInputView);
		row2.class.push('ck-nvtools-form__row_single');

		const row3 = new FormRowView(editor.locale);
		row3.children.add(this.updateNoAltOnlySwitchView);
		row3.class.push('ck-nvtools-form__row_single');

		const row4 = new FormRowView(editor.locale);
		row4.children.add(this.namePrefixInputView);
		row4.class.push('ck-nvtools-form__row_single');

		// Dòng hiển thị nội dung
		this.dataView = new FormRowView(editor.locale);

		this.setTemplate({
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-nvtools-form',
					'ck-responsive-form'
				],

				tabindex: '-1'
			},

			children: [
				row1,
				row2,
				row3,
				row4,
				this.dataView
			]
		});
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler({
			view: this
		});

		this.focusTracker.add(this.pathInputView.element!);
		this.focusTracker.add(this.browseButtonView.element!);
		this.focusTracker.add(this.altInputView.element!);
		this.focusTracker.add(this.updateNoAltOnlySwitchView.element!);
		this.focusTracker.add(this.namePrefixInputView.element!);

		this.keystrokes.listenTo(this.element!);
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the URL input.
	 */
	public focus(): void {
		this.pathInputView.focus();
	}

	/**
	 * Kiểm tra tính hợp lệ của form.
	 *
	 * @returns true|false
	 */
	public isValid(): boolean {
		this.resetFormStatus();

		let errorNumber = 0;

		for (const validator of this._validators) {
			if (!validator(this)) {
				errorNumber++;
			}
		}

		return errorNumber === 0;
	}

	/**
	 * Xóa dữ liệu, cảnh báo, tip và đưa về mặc định
	 *
	 * See {@link #isValid}.
	 */
	public resetFormStatus(): void {
		this.pathInputView.errorText = null;
		this.pathInputView.infoText = this._pathInputViewDefault!;

		this.namePrefixInputView.errorText = null;
		this.namePrefixInputView.infoText = this._prefixInputViewDefault!;
	}

	/**
	 * Tạo ô nhập path lưu ảnh
	 *
	 * @returns LabeledFieldView<InputTextView>
	 */
	private _createPathInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		this._pathInputViewDefault = t('Enter or browse to pick any file at the target location.');

		labeledInput.label = t('Folder to save');
		labeledInput.infoText = this._pathInputViewDefault;
		labeledInput.extendTemplate({
			attributes: {
				class: ['c10']
			}
		});

		inputField.inputMode = 'url';
		inputField.on('input', () => {
			this.pathInputValue = inputField.element!.value.trim();
		});

		return labeledInput;
	}

	/**
	 * Tạo nút duyệt chọn path lưu ảnh
	 *
	 * @returns ButtonView
	 */
	private _createBrowseButton(): LabeledFieldView<ButtonView> {
		const t = this.locale!.t;
		const makeButton = (labeledFieldView: LabeledFieldView, viewUid: string, statusUid: string) => {
			const button = new ButtonView(labeledFieldView.locale!);

			button.label = t('Browse');
			button.withText = true;
			button.extendTemplate({
				attributes: {
					class: ['ck-nvtools-button']
				}
			});
			button.on('execute', () => {
				console.log('Browse button clicked');
			});

			// Render trước để lấy cái element và gán ID vào
			button.render();
			button.element!.setAttribute('id', viewUid);

			return button;
		}

		const labeledButton = new LabeledFieldView(this.locale, makeButton);
		labeledButton.extendTemplate({
			attributes: {
				class: ['c2']
			}
		});

		return labeledButton;
	}

	/**
	 * Tạo ô nhập alt text cho ảnh
	 *
	 * @returns LabeledFieldView<InputTextView>
	 */
	private _createAltInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		labeledInput.label = t('Image alt text');

		inputField.inputMode = 'text';
		inputField.on('input', () => {
			this.altInputValue = inputField.element!.value.trim();
		});

		return labeledInput;
	}

	/**
	 * Tạo nút chuyển chỉ cập nhật ảnh không có alt
	 *
	 * @returns SwitchButtonView
	 */
	private _createUpdateNoAltOnlySwitch(): SwitchButtonView {
		const t = this.locale!.t;
		const button = new SwitchButtonView(this.locale!);

		button.label = t('Only update alt text for images without it');
		button.withText = true;
		button.extendTemplate({
			attributes: {
				class: ['ck-nvtools-switch-button']
			}
		});
		button.on('execute', () => {
			// Đảo trạng thái
			button.isOn = !button.isOn;
		});

		return button;
	}

	/**
	 * Tạo ô nhập prefix tên file ảnh
	 *
	 * @returns LabeledFieldView<InputTextView>
	 */
	private _createNamePrefixInput(): LabeledFieldView<InputTextView> {
		const t = this.locale!.t;

		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
		const inputField = labeledInput.fieldView;

		this._prefixInputViewDefault = t('Leave empty to use the original name.');

		labeledInput.label = t('Image filename prefix');
		labeledInput.infoText = this._prefixInputViewDefault;

		inputField.inputMode = 'text';
		inputField.on('input', () => {
			this.namePrefixInputValue = inputField.element!.value.trim();
		});

		return labeledInput;
	}
}
