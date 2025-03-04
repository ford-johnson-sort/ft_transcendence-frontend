import { Controller } from "./controller/Controller.js";
import { PongGameRenderer } from "./PongGameRenderer.js";
import PongManager from "./PongManager.js";
import { MOVEMENT, GAME_MODE, MATCH_TYPE } from "../../constants/constants.js";


export class PongGameRemoteLogic {
	constructor(controller1, controller2) {
		const {roomID: UUID, username} = PongManager.getState({matchType: MATCH_TYPE.REMOTE});
		// socket connection
		this.socket = new WebSocket(`wss://${window.location.host}/game/ws/pong/${UUID}/${username}`);
		this.socket.onmessage = (event)=> {
			const payload = JSON.parse(event.data);
			this.onEvent(payload);
		};
		controller1.setUpdater(this.sendMove.bind(this));
		this.fieldWidth = 120;
		this.fieldDepth = 170;
		this.paddleWidth = 18;
		this.speedZ = 1.8;
		this.player1 = {
			position: { x: 0, y: 0, z: 80 },
			score: 0,
			userName: null,
			controller: controller1
		};
		this.player2 = {
			position: { x: 0, y: 0, z: -80 },
			score: 0,
			userName: null,
			controller: new Controller(),
		};
		this.ball = {
			position: { x: 0, y: 0, z: 0 },
			velocity: { x: 0, y: 0, z: 0 },
		};
		this.isPlayer1Strike = false;
		this.isPlayer2Strike = false;
		this.isWallStrike = false;
		this.loop = this.loop.bind(this);
		this.targetScore = 1;
		this.pauseDuration = 1500;
		this.startTime = null;
		this.endTime = null;
		this.isHost = false;
		this.isGuest = false;
		this.channel = null;
		this.isEnd = false;
		this.winner = null;
		this.sendCount = 0;
		// 프레임 계산용 delta
		this.delta = 1000.0 / 60.0;
	}

	onEvent(event){
		if (GAME_MODE.META_EVENTS.some(mode=> mode === event.type)) {
			return this.onGameMetaMessage(event);
		}
		return this.onGameMessage(event);
	}

	onGameMetaMessage({type, data}){
		switch(type){
			case GAME_MODE.END_GAME:
				PongManager.notify({type, data});
				this.isEnd = true;
				this.player1.controller.setUpdater(()=>{}); // controller1의 updater를 빈 함수로 설정
				this.socket.close();
				break;
			case GAME_MODE.READY:
				this.player2.userName = data.opponent;
				this.player1.userName = data.username;
				break;
			case GAME_MODE.WAIT:
				PongManager.notify({type, data});
				break;
			case GAME_MODE.END_ROUND: {
				this.gameReset(); // 게임 리셋
				break;
			}
		}
	}

	onGameMessage({type, data}) {
		switch(type) {
			case GAME_MODE.MOVE_PADDLE:
				this.player2Update(data);
				break;
			case GAME_MODE.MOVE_BALL:
				this.ballUpdate(data);
				break;
		}
	}

	player2Update({ movement, position }) {
		switch (movement) {
			case MOVEMENT.LEFT_START:
				this.player2.controller.left = true;
				break;
			case MOVEMENT.LEFT_END:
				this.player2.controller.left = false;
				break;
			case MOVEMENT.RIGHT_START:
				this.player2.controller.right = true;
				break;
			case MOVEMENT.RIGHT_END:
				this.player2.controller.right = false;
				break;
			default:
				break;
		}
		const [x] = position;
		this.player2.position.x = x;		// this.player2.position.z = z;	}
	}

	ballUpdate({velocity, position}) {
		// console.log("beforeballUpdate", {...this.ball});
		this.ball.velocity.x = velocity[0];
		this.ball.velocity.z = velocity[1];
		this.ball.position.x = position[0];
		this.ball.position.z = position[1];
		// console.log("ballUpdate", {...this.ball});
	}

	/**
	 * @param {"KEYUP" | "KEYDOWN"} type
	 * @param {number} keycode
	 */

	sendMove(type, keycode) {
		const movement = MOVEMENT[type][keycode];
		if (!movement) return ;

		this.socket.send(
			JSON.stringify({
				type: GAME_MODE.MOVE_PADDLE,
				data: { movement }
			}
		));
	}


	gameReset() {
		this.ball.velocity.z = 0;
		this.ball.velocity.x = 0;
		this.ball.position.x = 0;
		this.ball.position.z = 0;
		this.player1.position.x = 0;
		this.player2.position.x = 0;
		this.pauseDuration = 1500;
	}

	update = async (delta) => {
		// 컨트롤러값으로 기체 움직임 적용
		let player1Moved = false;
		if (this.player1.controller.left == true) {
			this.player1.position.x -= 1.5 * delta;
			player1Moved = true;
		}
		if (this.player1.controller.right == true) {
			this.player1.position.x += 1.5 * delta;
			player1Moved = true;
		}
		if (this.player2.controller.left == true) {
			this.player2.position.x -= 1.5 * delta;
		}
		if (this.player2.controller.right == true) {
			this.player2.position.x += 1.5 * delta;
		}
		// 기체 움직임 범위 제한
		this.player1.position.x = Math.max(
			-this.fieldWidth / 2 + this.paddleWidth / 2,
			Math.min(this.fieldWidth / 2 - this.paddleWidth / 2, this.player1.position.x)
		);
		this.player2.position.x = Math.max(
			-this.fieldWidth / 2 + this.paddleWidth / 2,
			Math.min(this.fieldWidth / 2 - this.paddleWidth / 2, this.player2.position.x)
		);
		// 공 움직임

		// 서버에서 계산을 잘못하고있다 1번
		// remote logic ball effect
		this.ball.position.x += this.ball.velocity.x * delta;
		this.ball.position.z += this.ball.velocity.z * delta;

		// // 공이 벽에 충돌했을 경우
		if (this.ball.position.x >= this.fieldWidth / 2) {
			this.willstrike = true;
		} else if (this.ball.position.x <= -this.fieldWidth / 2) {
			this.isWallStrike = true;
		}
		// // 공이 라인을 넘었을 경우 (공 반사 or 실점 판정)
		if (this.ball.position.z >= this.fieldDepth / 2) { // 라인을 넘었을 경우 : 1p
		  if (this.player1.position.x - (this.paddleWidth / 2) <= this.ball.position.x && // 공 반사
			this.ball.position.x <= this.player1.position.x + (this.paddleWidth / 2)) {
				this.isPlayer1Strike = true;
			} 
		} else if (this.ball.position.z <= -this.fieldDepth / 2) { // 라인을 넘었을 경우 : 2p
			if (this.player2.position.x - (this.paddleWidth / 2) <= this.ball.position.x && // 공 반사
				this.ball.position.x <= this.player2.position.x + (this.paddleWidth / 2)) {
				this.isPlayer2Strike = true;
			} 
		}

	}

	async loop() {
		if (this.isEnd) {
			return ;
		}
		this.startTime = performance.now();
		if (this.endTime != null) {
			this.delta = this.startTime - this.endTime; // 각 컴퓨터 성능에 따른 프레임 속도 계산으로 공의 속도를 조절
		}
		// Logic
		if (this.pauseDuration) {
			this.pauseDuration = Math.max(this.pauseDuration - this.delta, 0);
		} else {
			this.update(this.delta / (1000.0 / 60.0));
		}
		this.endTime = performance.now();
		let gapTime = this.startTime - this.endTime;
		if (gapTime < (1000.0 / 60.0)) {
			setTimeout(this.loop, (1000.0 / 60.0) - gapTime);
		} else {
			setTimeout(this.loop, 0);
		}
	}
}
