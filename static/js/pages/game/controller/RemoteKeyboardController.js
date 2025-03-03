import Controller from './Controller';

class RemoteKeyboardController extends Controller {
	constructor() {
		super();
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
		console.log('Moving up');
	}

	moveDown() {
		console.log('Moving down');
	}

	moveLeft() {
		console.log('Moving left');
	}

	moveRight() {
		console.log('Moving right');
	}

	stopMovement() {
		console.log('Stopping movement');
	}
}

export default RemoteKeyboardController;
