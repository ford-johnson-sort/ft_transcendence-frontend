import PongManager from './PongManager.js'
/**
	WAIT = 대기중 접속 후 무조건 뜨는 상태
	READY?
		- 상대 유저 이름만 던져줌
	START, ->
		3,2,1, 카운트를 서버에서 맞추주기

		BALL MOVE,
		=
		PADDLE MOVE,
	GAME END,
		- reason: ?
*/
export class PongGameLogic {
	constructor(controller1, controller2, mode ) {
		this.fieldWidth = 120;
		this.fieldDepth = 170;
		this.paddleWidth = 18;
		this.speedZ = 1.8;
		//
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

	setHost(channel) {
		if (this.isHost || this.isGuest) {
			return false;
		}
		this.isHost = true;
		this.channel = channel;
		// TODO: WebSocket 어케 해야할지 모르겠음
		this.socket = new WebSocket(`wss://${window.location.host}/game/ws/pong/${channel['room_uuid']}/${channel['username']}`);
		// WebSocket 메세지 수신 이벤트 리스너 등록
		this.socket.onmessage = this.#recv.bind(this);
	}

	setGuest(channel) {
		if (this.isHost || this.isGuest) {
			return false;
		}
		this.isGuest = true;
		this.channel = channel;
		this.speedZ *= -1;
		this.ball.velocity.z = this.speedZ;
		this.socket = new WebSocket(`wss://${window.location.host}/game/ws/pong/${channel['room_uuid']}/${channel['username']}`);
		this.socket.onmessage = this.#recv.bind(this);
		this.updateGuestScore();
	}

	#send() {
		// 메시지에 player의 위치와 이름을 포함
		const message = {
		};
		this.socket.send(JSON.stringify(message));
	}

	#recv(event) {
		const data = JSON.parse(event.data);

	}

	async loop() {
		this.startTime = performance.now();
		if (this.endTime != null) {
			this.delta = this.startTime - this.endTime;
		}
		// Logic
		if (this.pauseDuration) {
			this.pauseDuration = Math.max(this.pauseDuration - this.delta, 0);
		} else {
			this.#update(this.delta / (1000.0 / 60.0));
			// 리모트인 경우 -> 서버에서 온 데이터로 교체 로 빠지거나 아니면 업데이트인데
			if ((this.isHost || this.isGuest) && this.socket.readyState === WebSocket.OPEN) {
				if (this.sendCount % 4 == 0) { // 30
					this.#send();
				}
				this.sendCount++;
			}
		}
		if (this.player1.score == this.targetScore || this.player2.score == this.targetScore) {
			this.isEnd = true;

			if (this.player1.score == this.targetScore) {
				this.winner = "1";
			} else {
				this.winner = "2";
			}
			if (this.isHost && this.socket.readyState === WebSocket.OPEN) {
				this.#send();
			}
			return PongManager.notify({type: 'GAME_END', data:{winner: this.winner}});
		}
		this.endTime = performance.now();
		let gapTime = this.startTime - this.endTime;
		if (this.isEnd) {
			return PongManager.notify({winner: this.winner});
		}
		if (gapTime < (1000.0 / 60.0)) {
			setTimeout(this.loop, (1000.0 / 60.0) - gapTime);
		} else {
			setTimeout(this.loop, 0);
		}
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


	async #remoteUpdate(){
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


class ServerSidePongUpdater{

	constructor(){

	}


	update(){
		socket.on()
	}
}

