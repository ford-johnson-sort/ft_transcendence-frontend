import { PongGameRenderer } from "./PongGameRenderer.js";

export class PongGameRemoteLogic {
	constructor(mode) {
			this.fieldWidth = 120;
			this.fieldDepth = 170;
			this.paddleWidth = 18;
			this.speedZ = 1.8;
			let [user1, user2] = [null, null];

			if([GAME_MODE.ONE_ON_ONE, GAME_MODE.TOURNAMENT].some(_mode => _mode === mode)){
				[user1, user2] = PongManager.getUser();
				console.log(user1, user2);
			}

			this.player1 = {
				position: { x: 0, y: 0, z: 80 },
				score: 0,
				userName: user1,
				controller: controller1
			};
			this.player2 = {
				position: { x: 0, y: 0, z: -80 },
				score: 0,
				userName: user2,
				controller: controller2
			};
			this.ball = {
				position: { x: 0, y: 0, z: 0 },
				velocity: { x: 0, y: 0, z: this.speedZ }
			};
			// 이거 3개 필요하고
			this.isPlayer1Strike = false;
			this.isPlayer2Strike = false;
			this.isWallStrike = false;
			//
			this.update = this.#update.bind(this);
			this.loop = this.loop.bind(this);
			this.targetScore = 1;
			// 도달하면
			this.pauseDuration = 1500;
			this.startTime = null;
			this.endTime = null;
			this.isHost = false;
			this.isGuest = false;
			this.channel = null;
			// 이 isEnd  {isdend, winner} -> game종료시 받아오기
			this.isEnd = false;
			this.winner = null;

			this.sendCount = 0;
			// 프레임 계산용 delta
			this.delta = 1000.0 / 60.0;
		}

	async #update(delta) {
		console.count('udpate call');
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
		if (Math.abs(this.player1.controller.stick.x) > 0.05 && player1Moved == false) {
			this.player1.position.x += 1.5 * this.player1.controller.stick.x * delta;
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
		this.ball.position.x += this.ball.velocity.x * delta;
		this.ball.position.z += this.ball.velocity.z * delta;

		// 공이 벽에 충돌했을 경우
		if (this.ball.position.x >= this.fieldWidth / 2) {
			this.ball.position.x = this.fieldWidth / 2;
			this.ball.velocity.x *= -1;
			this.isWallStrike = true;
		} else if (this.ball.position.x <= -this.fieldWidth / 2) {
			this.ball.position.x = -this.fieldWidth / 2;
			this.ball.velocity.x *= -1;
			this.isWallStrike = true;
		}
		// 공이 라인을 넘었을 경우 (공 반사 or 실점 판정)
		if (this.ball.position.z >= this.fieldDepth / 2) { // 라인을 넘었을 경우 : 1p
		  if (this.player1.position.x - (this.paddleWidth / 2) <= this.ball.position.x && // 공 반사
			this.ball.position.x <= this.player1.position.x + (this.paddleWidth / 2)) {
				this.ball.position.z = this.fieldDepth / 2;
				this.ball.velocity.z *= -1;
				this.ball.velocity.x = (this.ball.position.x - this.player1.position.x) / ((this.paddleWidth / 2) + 0.1) * this.speedZ;
				this.isPlayer1Strike = true;
			} else { // 실점 판정
			if (!this.isGuest){
				this.player2.score++;
				if (this.player1.scoreQuery) {
					if (this.isGuest == false) {
						this.player2.scoreQuery.innerHTML = this.player2.score;
					}
				}
				this.ball.velocity.z = -this.speedZ;
				this.ball.velocity.x = 0;
				this.ball.position.x = 0;
				this.ball.position.z = 0;
				this.player1.position.x = 0;
				this.player2.position.x = 0;
				this.pauseDuration = 1500;
				}
			}
		} else if (this.ball.position.z <= -this.fieldDepth / 2) { // 라인을 넘었을 경우 : 2p
			if (this.player2.position.x - (this.paddleWidth / 2) <= this.ball.position.x && // 공 반사
			this.ball.position.x <= this.player2.position.x + (this.paddleWidth / 2)) {
				this.ball.position.z = -this.fieldDepth / 2;
				this.ball.velocity.z *= -1;
				this.ball.velocity.x = this.ball.velocity.x = (this.ball.position.x - this.player2.position.x) / ((this.paddleWidth / 2) + 0.1) * this.speedZ;
				this.isPlayer2Strike = true;
			} else { // 실점 판정
			if (!this.isGuest){
				this.player1.score++;
				if (this.player1.scoreQuery) {
					if (this.isGuest == false) {
						this.player1.scoreQuery.innerHTML = this.player1.score;
					}
				}
				this.ball.velocity.z = this.speedZ;
				this.ball.velocity.x = 0;
				this.ball.position.x = 0;
				this.ball.position.z = 0;
				this.player1.position.x = 0;
				this.player2.position.x = 0;
				this.pauseDuration = 1500;
				}
			}
		}

		// 공 속도 점점 빠르게
		if (this.ball.velocity.z > 0) {
		  this.ball.velocity.z += 0.001 * delta;
		} else if (this.ball.velocity.z < 0) {
		  this.ball.velocity.z -= 0.001 * delta;
		}
	}
}

