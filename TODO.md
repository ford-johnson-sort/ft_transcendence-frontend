<!-- 생각중인 구조 -->
# Pong Game Page

## Pong Game Logic

FieldWidth : 120 <br>
FiledDepth = 160 <br>
paddleWidth = 18 <br>
speedZ = 1.8; <br>
```
player1 = {
	position: { x: 0, y: 0, z: 80},
	score: 0,
	scoreQuery: null, -> html 에서 각 플레이어의 score div Query (three js로 변경해서 될수 도 있음 미적용)
	controller: controller1 -> Controller Setting
};
```
```
player2 = {
	position: { x: 0, y: 0, z: -80},
	score: 0,
	scoreQuery: null, -> html 에서 각 플레이어의 score div Query
	controller: controller1 -> Controller Setting
};
```
```
ball = {
	position {x: 0, y: 0, z: 0},
	velocity: {x: 0, y: 0, z: speedZ }
};
```
isPlayer1Strike = false; -> Player1의 paddle 충돌시 충돌 및 카메라 이펙트 핸들링 용 <br>
isPlayer2Strike = false; -> Player2의 paddle 충돌시 충돌 및 카메라 이펙트 핸들링 용 <br>
isWallStrike = false; -> 벽 이펙트 핸들링 용 <br>
update = this.#update.bind(this); -> 프라이빗 매서드 바인드 <br>
loop = this.loop.bind(this);<br>
targetScroe = 5; -> 게임 승리 조건 스코어<br>
isEnd = false; -> 게임 종료시 State <br>
winner = null; -> 승자 판정용<br>
delta = 1000.0 / 60.0<br>

```

```
