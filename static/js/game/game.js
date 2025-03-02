/*
main game logic
*/

import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

let context = {};


function runGame(ROOM) {
  const chatSocket = new WebSocket(
    `wss://${window.location.host}/game/ws/pong/${ROOM['room_uuid']}/${ROOM['username']}`
  );
  context['chatSocket'] = chatSocket;

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    if (data.type == 'wait') {
      alert(data.message);
    }
    else if (data.type == 'start') {
      context['p1'] = data.p1;
      context['keyDownHandler'] = (event) => {
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
          context.chatSocket.send(JSON.stringify({
            'type': 'move',
            'action': 'start',
            'key': event.key == 'ArrowUp' ? 'up' : 'down',
          }));
          if (context.p1) {
            context.paddle1MoveUp = event.key == 'ArrowUp' ? true : false;
            context.paddle1MoveDown = event.key == 'ArrowUp' ? false : true;
          } else {
            context.paddle2MoveUp = event.key == 'ArrowUp' ? true : false;
            context.paddle2MoveDown = event.key == 'ArrowUp' ? false : true;
          }
        }
      };
      
      context['keyUpHandler'] = (event) => {
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
          context.chatSocket.send(JSON.stringify({
            'type': 'move',
            'action': 'end',
            'key': event.key == 'ArrowUp' ? 'up' : 'down',
          }));
          if (context.p1) {
            context.paddle1MoveUp = false;
            context.paddle1MoveDown = false;
          } else {
            context.paddle2MoveUp = false;
            context.paddle2MoveDown = false;
          }
        }
      };

      document.addEventListener('keyup', context.keyUpHandler);
      document.addEventListener('keydown', context.keyDownHandler);
      animate();
    } else if (data.type == 'end') {
      // TODO
    } else if (data.type == 'move') {
      if (context.p1) {
        if (data.action == 'start') {
          context.paddle2MoveUp = data.key == 'up' ? true : false;
          context.paddle2MoveDown = data.key == 'up' ? false : true;
        } else {
          context.paddle2MoveUp = false;
          context.paddle2MoveDown = false;
        }
      } else {
        if (data.action == 'start') {
          context.paddle1MoveUp = data.key == 'up' ? true : false;
          context.paddle1MoveDown = data.key == 'up' ? false : true;
        } else {
          context.paddle1MoveUp = false;
          context.paddle1MoveDown = false;
        }
      }
    }
  };

  craeteScene();
  createPaddle();
  // TODO: show modal for waiting
  // showWaiting();

  
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = context.renderer;
    const camera = context.camera;
    const camera2 = context.camera2;
  
    renderer.setSize(width, height);
  
    // 카메라1 업데이트
    camera.aspect = (width / 2) / height;
    camera.updateProjectionMatrix();
  
    // 카메라2 업데이트
    camera2.aspect = (width / 2) / height;
    camera2.updateProjectionMatrix();
  });

}

function craeteScene() {
  // 카메라 1 2 설정
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    (window.innerWidth / 2) / window.innerHeight,
    0.1,
    1000
    );
  camera.position.set(0, 0, 10);
  camera.lookAt(scene.position);
  const camera2 = new THREE.PerspectiveCamera(
    75,
    (window.innerWidth / 2) / window.innerHeight,
    0.1,
    1000
    );
  camera2.position.set(0, -15, 1);
  camera2.lookAt(scene.position);
  
  // 카메라, scene 등록
  context['scene'] = scene;
  context['camera'] = camera;
  context['camera2'] = camera2;


  // renderer 설정
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor(0x808080, 1);
  renderer.setScissorTest(true);

  // renderer 등록
  document.body.appendChild( renderer.domElement );
  context['renderer'] = renderer;

  // 조명 추가
  const directionalLight = new THREE.DirectionalLight(0xffffff, 20); // 색상: 흰색, 강도: 1
  directionalLight.position.set(5, 5, 5); // 빛의 방향 설정
  scene.add(directionalLight);
}

function createPaddle() {
  const scene = context.scene;

  // 바닥 메쉬
  const geometry = new THREE.BoxGeometry(10, 8, 0.1);
  const meterial = new THREE.MeshStandardMaterial( {color: 0x000000 });
  const cube = new THREE.Mesh(geometry, meterial);
  scene.add(cube);
  // 패들 메쉬
  const paddleGeometry = new THREE.BoxGeometry(0.15, 1.5, 0.3);
  const paddle1 = new THREE.Mesh(paddleGeometry, meterial);
  const paddle2 = new THREE.Mesh(paddleGeometry, meterial);
  paddle1.position.set(4.7, 0, 0.4);
  paddle2.position.set(-4.7, 0, 0.4);
  scene.add(paddle1);
  scene.add(paddle2);
  
  // 공 메쉬
  const BallGeometry = new THREE.SphereGeometry(0.15, 128, 128);
  const Ball = new THREE.Mesh(BallGeometry, meterial);
  Ball.position.set(0, 0, 0.3);
  scene.add(Ball);

  // 패들, 공 등록
  context['paddle1'] = paddle1;
  context['paddle2'] = paddle2;
  context['Ball'] = Ball;
  context['paddleSpeed'] = 0.2;
  context['paddle1MoveUp'] = false;
  context['paddle1MoveDown'] = false;
  context['paddle2MoveUp'] = false;
  context['paddle2MoveDown'] = false;
  context['ballVelocityX'] = 0.1;
  context['ballVelocityY'] = 0.07;
}

function animate() {
	requestAnimationFrame(animate);
	// renderer.render(scene, camera);
	const width = window.innerWidth;
	const height = window.innerHeight;

  let scene = context.scene;
  let camera = context.camera;
  let camera2 = context.camera2;
  let renderer = context.renderer;
  let paddleSpeed = context.paddleSpeed;
  let paddle1 = context.paddle1;
  let paddle2 = context.paddle2;
  let paddle1MoveUp = context.paddle1MoveUp;
  let paddle1MoveDown = context.paddle1MoveDown;
  let paddle2MoveUp = context.paddle2MoveUp;
  let paddle2MoveDown = context.paddle2MoveDown;
  let Ball = context.Ball;
  let ballVelocityX = context.ballVelocityX;
  let ballVelocityY = context.ballVelocityY;

	if (paddle1MoveUp) {
		if (paddle1.position.y < 3.15)
			paddle1.position.y += paddleSpeed;
	}
	if (paddle1MoveDown) {
		if (paddle1.position.y > -3.15)
			paddle1.position.y -= paddleSpeed;
	}

	if (paddle2MoveUp) {
		if (paddle2.position.y < 3.15)
			paddle2.position.y += paddleSpeed;
	}
	if (paddle2MoveDown) {
		if (paddle2.position.y > -3.15)
			paddle2.position.y -= paddleSpeed;
	}

	// Ball
	Ball.position.x += ballVelocityX;
	Ball.position.y += ballVelocityY;

	const ballRadius = 0.15;

	// 바닥(게임 영역) 크기: width = 10, height = 7
	const floorHalfWidth = 10 / 2;  // 5
	const floorHalfHeight = 7 / 2;  // 3.5

	// 상하 경계 처리
	if (Ball.position.y + ballRadius >= floorHalfHeight || Ball.position.y - ballRadius <= -floorHalfHeight) {
		ballVelocityY = -ballVelocityY;
	}

	const paddleHalfWidth = 0.15 / 2;
	const paddleHalfHeight = 1.5 / 2;

	// 오른쪽 패들 (pwsdaddle1)과의 충돌 판정
	// 공이 오른쪽으로 이동 중일 때만 판정합니다.
  // 공과 패들 충돌 감지 및 반사 각도 조정 함수
  let handlePaddleCollision = (paddle) => {
    // 패들의 중앙과 충돌 위치 차이를 이용하여 충돌 강도(impactFactor)를 계산합니다.
    const impactFactor = (Ball.position.y - paddle.position.y) / paddleHalfHeight;
    // X 방향 반전
    ballVelocityX = -ballVelocityX;
    // Y 방향 속도는 충돌 위치에 따라 약간 조정합니다.
    ballVelocityY += impactFactor * 0.05;
    // 중복 충돌을 방지하기 위해 공을 패들 밖으로 살짝 밀어냅니다.
    Ball.position.x += ballVelocityX * 2;
	}

	// 오른쪽 패들(paddle1)과의 충돌 판정 (공이 오른쪽으로 이동 중일 때)
	if (
		ballVelocityX > 0 &&
		Ball.position.x + ballRadius >= paddle1.position.x - paddleHalfWidth &&
		Ball.position.y <= paddle1.position.y + paddleHalfHeight &&
		Ball.position.y >= paddle1.position.y - paddleHalfHeight
	) {
		handlePaddleCollision(paddle1);
	}
	// 왼쪽 패들(paddle2)과의 충돌 판정 (공이 왼쪽으로 이동 중일 때)
	else if (
		ballVelocityX < 0 &&
		Ball.position.x - ballRadius <= paddle2.position.x + paddleHalfWidth &&
		Ball.position.y <= paddle2.position.y + paddleHalfHeight &&
		Ball.position.y >= paddle2.position.y - paddleHalfHeight
	) {
		handlePaddleCollision(paddle2);
	}

	// 왼쪽 패들 (paddle2)과의 충돌 판정
	// 공이 왼쪽으로 이동 중일 때만 판정합니다.

	renderer.setViewport(0, 0, width / 2, height);
	renderer.setScissor(0, 0, width / 2, height);
	renderer.render(scene, camera);

	renderer.setViewport(width / 2, 0, width / 2, height);
	renderer.setScissor(width / 2, 0, width / 2, height);
	renderer.render(scene, camera2);
}

export {runGame};