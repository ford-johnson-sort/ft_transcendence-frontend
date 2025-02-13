import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

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


// 패들 설정
const paddleSpeed = 0.2;

let paddle1MoveUp = false;
let paddle1MoveDown = false;
let paddle2MoveUp = false;
let paddle2MoveDown = false;

document.addEventListener('keydown', (event) => {
	switch(event.key) {
		case 'ArrowUp':
			paddle1MoveUp = true;
			break
		case 'ArrowDown':
			paddle1MoveDown = true;
			break
		case 'w' || 'W':
			paddle2MoveUp = true;
			break;
		case 's' || 'S' :
			paddle2MoveDown = true;
			break;
	}
});

document.addEventListener('keyup', (event) => {
	console.log(event.key);
	switch(event.key) {
		case 'ArrowUp':
			paddle1MoveUp = false;
			break;
		case 'ArrowDown':
			paddle1MoveDown = false;
			break;
		case 'w' || 'W':
			paddle2MoveUp = false;
			break;
		case 's' || 'S' :
			paddle2MoveDown = false;
			break;
	}
});

// renderer 설정
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x808080, 1);
renderer.setScissorTest(true);
document.body.appendChild( renderer.domElement );

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

let ballVelocityX = 0.1;
let ballVelocityY = 0.07;

// 조명 추가
const directionalLight = new THREE.DirectionalLight(0xffffff, 20); // 색상: 흰색, 강도: 1
directionalLight.position.set(5, 5, 5); // 빛의 방향 설정
scene.add(directionalLight);


function animate() {
	requestAnimationFrame( animate);
	// renderer.render(scene, camera);
	const width = window.innerWidth;
	const height = window.innerHeight;

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
function handlePaddleCollision(paddle) {
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
animate();

window.addEventListener('resize', () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	renderer.setSize(width, height);

	// 카메라1 업데이트
	camera.aspect = (width / 2) / height;
	camera.updateProjectionMatrix();

	// 카메라2 업데이트
	camera2.aspect = (width / 2) / height;
	camera2.updateProjectionMatrix();
});
