import { Controller } from "./Controller.js";

/**
 * 게임 플레이용 키보드를 설정하는 및 이벤트 등록 관리를 하는 클래스
 * leftKey, rightKey, Upkey, DownKey, HotKey Codes
 */
export class KeyboardController extends Controller {
	constructor(leftKeycode, rightKeycode) {
		super();
		this.updater = console.log;
		this.leftKeycode = leftKeycode;
		this.rightKeycode = rightKeycode;
		this.keydownListener = this.keydownListener.bind(this);
		this.keyupListener = this.keyupListener.bind(this);
		this.lastKeyStroke = null;
		window.addEventListener('keydown', this.keydownListener);
		window.addEventListener('keyup', this.keyupListener);
	}

	keydownListener(event) {
		const keycode = event.keyCode;
		switch (keycode) {
			case this.leftKeycode:
				this.left = true;
				break;
			case this.rightKeycode:
				this.right = true;
				break;
			default:
				return ;
		}
		if (this.lastKeyStroke !== keycode){
			this.lastKeyStroke = keycode;
			this.updater("KEYDOWN", keycode);
		}
	}

	keyupListener(event) {
		const keycode = event.keyCode;
		switch (keycode) {
			case this.leftKeycode:
				this.left = false;
				break;
			case this.rightKeycode:
				this.right = false;
				break;
			default:
				return ;
		}
		if (this.lastKeyStroke !== keycode){
			this.lastKeyStroke = keycode;
			this.updater("KEYDOWN", keycode);
		}
	}

	setUpdater(fn) {
		this.updater = fn;
	}
}
