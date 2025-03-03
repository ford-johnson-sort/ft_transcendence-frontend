import { PongGameLogic } from "./PongGameLogic.js";
import { PongGameRenderer } from "./PongGameRenderer.js";
import { PongGameRemoteLogic } from "./PongGameRemoteLogic.js";

export class PongGame {
	constructor() {
		window.addEventListener('popstate', (e) => {
			this.destroy();
		});
	}

	async init(controller1, controller2, divID, mode){
		this.controller1 = controller1;
		this.controller2 = controller2;

		// if (isRemote) {
		// 	this.logic = new PongGameRemoteLogic(controller1, controller2, mode);
		// } else { // 기존 로직은 Local
		// 	this.logic = new PongGameLogic(controller1, controller2, mode);
		// }
		this.logic = new PongGameLogic(controller1, controller2, mode);
		this.renderer = new PongGameRenderer(); // PongGameRenderer는 PongGameLogic을 받아서 그려주는 역할
		await this.renderer.init(divID, this.logic);
	}

	async start() {
		await this.renderer.loop();
		this.logic.loop();
	}

	async isEnd() {
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



