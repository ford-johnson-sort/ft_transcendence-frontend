import Controller from './Controller';


/*
	RemoteKeyboardController는 KeyboardController를 상속받아서
	RemotePlayPage에서 사용하는 Controller이다.
	RemotePlayPage에서는 KeyboardController를 사용하지 않고
	RemoteKeyboardController를 사용한다.
	RemoteKeyboardController는 키보드 이벤트를 받아서
	게임을 조작하는 Controller이다.
*/
class RemoteKeyboardController extends Controller {
	constructor(socket) {
		super();
    this.socket = socket;
		this.initRemoteKeyboardListeners();
	}

	initRemoteKeyboardListeners() {
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
		window.addEventListener('keyup', this.handleKeyUp.bind(this));
	}
	handleKeyDown(event) {
		switch (event.key) {
			case 'ArrowUp':
				this.moveUp();
				break;
			case 'ArrowDown':
				this.moveDown();
				break;
			case 'ArrowLeft':
				this.moveLeft();
				break;
			case 'ArrowRight':
				this.moveRight();
				break;
			default:
				break;
		}
	}

	handleKeyUp(event) {
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowDown':
			case 'ArrowLeft':
			case 'ArrowRight':
				this.stopMovement();
				break;
			default:
				break;
		}
	}

	moveUp() {
		this.socket.send()
	}

	moveDown() {
				this.socket.send()

	}

	moveLeft() {
				this.socket.send()

	}

	moveRight() {
				this.socket.send()

	}

	stopMovement() {
				this.socket.send()

	}
}

export default RemoteKeyboardController;
