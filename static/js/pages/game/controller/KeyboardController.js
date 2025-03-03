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
		this.lastKeyStroke = {
			type: null,
			keycode: null,
		}
		window.addEventListener('keydown', this.keydownListener);
		window.addEventListener('keyup', this.keyupListener);
	}

	keydownListener(event) {
		const keycode = event.keyCode;
		const type = "KEYDOWN";
		if (this.lastKeyStroke.type == type && this.lastKeyStroke.keycode === keycode)
			return ;
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
		this.lastKeyStroke = { type, keycode };
		this.updater(type, keycode);
	}

	keyupListener(event) {
		const keycode = event.keyCode;
		const type = "KEYUP";
		
		if (this.lastKeyStroke.type == type && this.lastKeyStroke.keycode == keycode)
			return ;
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
		this.lastKeyStroke = { type, keycode }
		this.updater(type, keycode);
	}

	setUpdater(fn) {
		this.updater = fn;
	}
}
