import { PongGameLogic } from "./PongGameLogic.js";
import { PongGameRenderer } from "./PongGameRenderer.js";


export class PongGame {
	constructor() {
		window.addEventListener('popstate', (e) => {
			this.destroy();
		});
	}

	async init(controller1, controller2, skin1, skin2, divID){
		this.controller1 = controller1;
		this.controller2 = controller2;
		this.logic = new PongGameLogic(controller1, controller2);
		this.renderer = new PongGameRenderer();
		await this.renderer.init(divID, this.logic, skin1, skin2);
	}

	setHost(channel) {
		this.logic.setHost(channel);
	}

	setGuest(channel) {
		this.logic.setGuest(channel);
	}

	async start() {
		await this.renderer.loop();
		this.logic.loop();
	}

	async isEnd() {
		// Promise 반환
		return new Promise((resolve) => {
			const checkInterval = 100; // 체크 주기 (ms)

			const intervalId = setInterval(() => {
				if (this.logic === null ) {
					clearInterval(intervalId);
					return ;
				}
				if (this.logic.isEnd === true) {
					clearInterval(intervalId);
					resolve(true);
				}
			}, checkInterval);
		});
	}

	destroy() {
		if (this.logic !== null) {
			if (globalState.gameMode == "remote") {
				this.logic.socket.close();
			}
			this.logic.isEnd = true;
		}
		if (this.renderer !== null) {
			this.renderer.dispose();
		}
		this.controller1 = null;
		this.controller2 = null;
		this.logic = null;
		this.renderer = null;
	}
}



