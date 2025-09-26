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
	FormRowView,
	View,
	type Editor
} from 'ckeditor5';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils.js';

import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/nvtools.css';

import NVToolsUI from './nvtoolsui.js';

import b2h2Icon from '../theme/icons/b2h2.svg';
import removeLinkIcon from '../theme/icons/remove-link.svg';
import imageDownloadIcon from '../theme/icons/image-download.svg';

/**
 * The nvtools form view controller class.
 */
export class NVToolsFormView extends View {


	/**
	 * Tracks information about the DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Nút chuyển thẻ b thành thẻ h2
	 */
	public b2h2ButtonView: ButtonView;

	/**
	 * Nút xóa liên kết ngoài
	 */
	public clrLinksButtonView: ButtonView;

	/**
	 * Nút lấy ảnh về máy chủ
	 */
	public downloadImageButtonView: ButtonView;

	/**
	 * The editor instance.
	 */
	private editor: Editor;

	/**
	 * @param locale
	 */
	constructor(editor: Editor) {
		super(editor.locale);

		this.editor = editor;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.b2h2ButtonView = this._createB2H2Button();
		this.clrLinksButtonView = this._createClrLinksButton();
		this.downloadImageButtonView = this._createDownloadImageButton();

		const uploadUrl = this.editor.config.get('simpleUpload.uploadUrl')!;

		// Dòng nhập URL
		const row1 = new FormRowView(editor.locale);
		row1.children.add(this.b2h2ButtonView);
		row1.children.add(this.clrLinksButtonView);

		// Có tính năng tải lên thì hiển thị nút lưu ảnh
		if (!!uploadUrl) {
			row1.children.add(this.downloadImageButtonView);
		}

		row1.class.push('ck-nvtools-row');

		this.setTemplate({
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-nvtools-panel'
				],

				tabindex: '-1'
			},

			children: [
				row1
			]
		});
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add(this.b2h2ButtonView.element!);
		this.focusTracker.add(this.clrLinksButtonView.element!);

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
	 * Tạo nút chuyển thẻ b thành thẻ h2
	 *
	 * @returns ButtonView
	 */
	private _createB2H2Button(): ButtonView {
		const t = this.locale!.t;
		const button = new ButtonView(this.locale!);

		button.label = t('Convert b to h2 tag');
		button.withText = true;
		button.icon = b2h2Icon;
		button.on('execute', () => {
			const dialog = this.editor.plugins.get('Dialog');
			dialog.hide();
			this.editor.execute('b2h2');
		});

		return button;
	}

	/**
	 * Tạo nút xóa liên kết ngoài
	 *
	 * @returns ButtonView
	 */
	private _createClrLinksButton(): ButtonView {
		const t = this.locale!.t;
		const button = new ButtonView(this.locale!);

		button.label = t('Remove external links');
		button.withText = true;
		button.icon = removeLinkIcon;
		button.on('execute', () => {
			const dialog = this.editor.plugins.get('Dialog');
			dialog.hide();
			this.editor.execute('removeExternalLinks');
		});

		return button;
	}

	/**
	 * Tạo nút lấy ảnh về máy chủ
	 *
	 * @returns ButtonView
	 */
	private _createDownloadImageButton(): ButtonView {
		const t = this.locale!.t;
		const button = new ButtonView(this.locale!);

		button.label = t('Save external image');
		button.withText = true;
		button.icon = imageDownloadIcon;
		button.on('execute', () => {
			const dialog = this.editor.plugins.get('Dialog');
			dialog.hide();

			const nvtoolsui: NVToolsUI = this.editor.plugins.get('NVToolsUI');
			nvtoolsui.showDialogSaveExternalImage();
		});

		return button;
	}
}
