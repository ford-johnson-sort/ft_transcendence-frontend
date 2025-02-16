import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

export const pongPage = {
	async render() {
		const container = document.createElement('div');
		container.setAttribute('id', 'pong-game-container');

		// Three.js가 렌더링될 위치
		container.innerHTML = `<div id="pongCanvas"></div>`;

		setTimeout(() => {
			startPongGame();
		}, 0);

		return container;
	},
	css: 'styles/css/pongPage.css'
};

function startPongGame() {
	// Three.js 초기 설정
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		75, window.innerWidth / window.innerHeight, 0.1, 1000
	);
	camera.position.set(0, 0, 10);
	camera.lookAt(scene.position);

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x808080, 1);
	document.getElementById("pongCanvas").appendChild(renderer.domElement);

	// 조명 추가
	const light = new THREE.DirectionalLight(0xffffff, 2);
	light.position.set(5, 5, 5);
	scene.add(light);

	// 게임 요소 생성
	const paddleGeometry = new THREE.BoxGeometry(0.15, 1.5, 0.3);
	const ballGeometry = new THREE.SphereGeometry(0.15, 32, 32);
	const groundGemetry = new THREE.BoxGeometry(12, 7, 0.3);
	const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

	const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
	const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
	const ball = new THREE.Mesh(ballGeometry, material);
	const ground = new THREE.Mesh(groundGemetry, material);

	paddle1.position.set(4.7, 0, 0.4);
	paddle2.position.set(-4.7, 0, 0.4);
	ball.position.set(0, 0, 0.3);
	ground.position.set(0, 0, 0);

	scene.add(paddle1, paddle2, ball, ground);

	// 게임 상태 변수
	let paddleSpeed = 0.2;
	let ballVelocity = { x: 0.1, y: 0.07 };
	let paddle1MoveUp = false, paddle1MoveDown = false;
	let paddle2MoveUp = false, paddle2MoveDown = false;

	// 키보드 이벤트 핸들링 (WebSocket 없이 직접 처리)
	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowUp") paddle1MoveUp = true;
		if (event.key === "ArrowDown") paddle1MoveDown = true;
		if (event.key === "w") paddle2MoveUp = true;
		if (event.key === "s") paddle2MoveDown = true;
	});

	document.addEventListener("keyup", (event) => {
		if (event.key === "ArrowUp") paddle1MoveUp = false;
		if (event.key === "ArrowDown") paddle1MoveDown = false;
		if (event.key === "w") paddle2MoveUp = false;
		if (event.key === "s") paddle2MoveDown = false;
	});

	// 게임 루프 (애니메이션)
	function animate() {
		requestAnimationFrame(animate);

		// 패들 이동
		if (paddle1MoveUp && paddle1.position.y < 3.15) paddle1.position.y += paddleSpeed;
		if (paddle1MoveDown && paddle1.position.y > -3.15) paddle1.position.y -= paddleSpeed;
		if (paddle2MoveUp && paddle2.position.y < 3.15) paddle2.position.y += paddleSpeed;
		if (paddle2MoveDown && paddle2.position.y > -3.15) paddle2.position.y -= paddleSpeed;

		// 공 이동
		ball.position.x += ballVelocity.x;
		ball.position.y += ballVelocity.y;

		// 벽 충돌
		if (ball.position.y >= 3.5 || ball.position.y <= -3.5) {
			ballVelocity.y = -ballVelocity.y;
		}

		// 패들 충돌 처리
		const checkCollision = (paddle) => {
			return (
				ball.position.x + 0.15 >= paddle.position.x - 0.15 &&
				ball.position.x - 0.15 <= paddle.position.x + 0.15 &&
				ball.position.y <= paddle.position.y + 0.75 &&
				ball.position.y >= paddle.position.y - 0.75
			);
		};

		if (ball.position.x > 7 || ball.position.x < -7)
		{
			ball.position.set(0, 0);
		}
		if (checkCollision(paddle1) || checkCollision(paddle2)) {
			ballVelocity.x = -ballVelocity.x;
		}

		renderer.render(scene, camera);
	}

	animate();
}
