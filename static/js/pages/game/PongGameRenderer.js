import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Preload } from "../../utils/preload.js"
import { PongGameLogic } from './PongGameLogic.js';

export class PongGameRenderer {
	constructor() {

	};
	/**
	 *
	 * @param {*} divID 렌더시킬 DIV ID
	 * @param {*} pongGame PongGameLogic
	 * @param {*} player1Skin Player Skin (Defulat)
	 * @param {*} player2Skin Player Skin (default)
	 */

	async init(divID, pongGameLogic) {
		this.pongGameLogicInstance = pongGameLogic;
		this.gltfLoader = new GLTFLoader();
		this.scene = new THREE.Scene();
		this.preLoader = Preload;
		this.rgbeLoader = Preload.RGBELoader;
		// 카메라 세팅
		this.camera = Preload.camera;
		this.rotationCenter = new THREE.Object3D();
		this.rotationCenter.add(this.camera);
		this.scene.add(this.rotationCenter);
		// 렌더러
		this.renderer = Preload.renderer;
		document.getElementById(divID).appendChild(this.renderer.domElement);
		// 포스트 프로세싱
		this.pmremGenerator = Preload.pmremGenerator;
		// Font 로더
		this.fontLoader = new FontLoader();
		// 조명 추가
		this.ambientLight = new THREE.DirectionalLight(0xffffff, 2);
		this.scene.add(this.ambientLight);
		// 공
		const ballGeometry = new THREE.SphereGeometry(2, 16, 16);
		const ballMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0,
		metalness: 1,
	});
	this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
	this.ballLight = new THREE.PointLight(0xff0000, 10000, 100);
	this.ballLight.position.set(0, 0, 0);
	this.ball.add(this.ballLight);
	this.scene.add(this.ball);

	await this.setPlayer1UnitDefault();
	await this.setPlayer2UnitDefault();
	await this.setWallModel();
	this.animate = this.animate.bind(this);
	this.resizeListener = this.resizeListener.bind(this);
	window.addEventListener('resize', this.resizeListener);
	this.clock = new THREE.Clock();
	this.setTopView();
	}

	resizeListener() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	/**
	 *
	 * @param {gltf모델} url
	 * @returns Promise return
	 */
	loadGltfModel(url) {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(url, (gltf) => {
				resolve(gltf);
			}, undefined, (error) => {
				reject(error);
			});
		});
	}

	/*
	 * Wall Model import
	 */
	async setWallModel() {
		try {
			const gltfLeft = await this.loadGltfModel("/static/assets/glb/wall.glb");
			const gltfRight = await this.loadGltfModel("/static/assets/glb/wall.glb");
			const gltfFloor = await this.loadGltfModel("/static/assets/glb/wall.glb");
			this.wallUnitLeft = gltfLeft.scene;
			this.wallUnitLeft.position.set(61, 0, 0);
			this.wallUnitLeft.scale.set(1, 4, 4);
			this.wallUnitRight = gltfRight.scene;
			this.wallUnitRight.position.set(-61, 0, 0);
			this.wallUnitRight.scale.set(1, 4, 4);
			this.wallUnitFloor = gltfFloor.scene;
			this.wallUnitFloor.position.set(0, -20, 0);
			this.wallUnitFloor.scale.set(120, 1, 160);
			this.scene.add(this.wallUnitRight);
			this.scene.add(this.wallUnitLeft);
			this.scene.add(this.wallUnitFloor);
		} catch (error) {
			console.error("Error Loading Model: ", error);
		}
	}
	/**
	 * Player Model Default import
	 */
	async setPlayer1UnitDefault() {
		try {
			const gltf = await this.loadGltfModel("/static/assets/glb/sabre.glb");
			this.player1Unit = gltf.scene;
			this.player1Unit.position.set(0, 0, 80);
			this.player1Unit.rotation.set(Math.PI * -0.2, 0, 0);
			this.player1Unit.scale.set(6, 4, 4);
			this.player1Unit.traverse(function (child) {
				if (child.isMesh) {
					if (child.material) {
						child.material.metalness = 1.0;
						child.material.roughness = 0.1;
						child.material.needsUpdate = true;
					}
				}
			});
			this.player1UnitMixer = null;
			const thrustLight = new THREE.PointLight(0xff0000, 10000, 100);
			thrustLight.position.set(0, -6, -2); // 부모 객체의 로컬 좌표계 기준으로 위치 설정
			this.player1Unit.add(thrustLight);
			this.scene.add(this.player1Unit);
			if (!this.pongGameLogicInstance.player1.userName  || this.player1Unit == null) {
				return ;
			}
			this.playerNameTextureLoad(this.pongGameLogicInstance.player1.userName, 'player1', this.player1Unit);
		} catch (error) {
			console.error("Error Loading Model: ", error);
		}
	}

	async setPlayer2UnitDefault() {
		try {
			const gltf = await this.loadGltfModel("/static/assets/glb/sabre.glb");
			this.player2Unit = gltf.scene;
			this.player2Unit.position.set(0, 0, -80);
			this.player2Unit.rotation.set(Math.PI * 0.2, Math.PI, 0);
			this.player2Unit.scale.set(6, 4, 4);
			this.player2Unit.traverse(function (child) {
				if (child.isMesh) {
					if (child.material) {
						child.material.metalness = 1.0;
						child.material.roughness = 0.1;
						child.material.needsUpdate = true;
					}
				}
			});
			this.player2UnitMixer = null;
			const thrustLight = new THREE.PointLight(0xff0000, 10000, 50);
			thrustLight.position.set(0, 6, 4); // 부모 객체의 로컬 좌표계 기준으로 위치 설정
			this.player2Unit.add(thrustLight);
			this.scene.add(this.player2Unit);
			if (this.pongGameLogicInstance.player2.userName == null || this.player2Unit == null) {
				return ;
			}
			this.playerNameTextureLoad(this.pongGameLogicInstance.player2.userName, 'player2', this.player2Unit);
		} catch (error) {
			console.error("Error Loading Model: ", error);
		}
	}

	playerNameTextureLoad = (name, id, playerUnit) => {
		this.fontLoader.load("/static/assets/font/NanumHuman TTF Regular_Regular.json", (font) => {
			const textGeometry = new TextGeometry(name, {
				// 텍스트 뚫어야함
				font: font,
				size: 1,
				height: 0.000000000001,
				curveSegments: 12,
				bevelEnabled: false,
				bevelThickness: 0.03,
				bevelSize: 0.01,
				bevelSegments: 5,
				bevelThickness: 0.1,
				depth: 0.1
			});
			textGeometry.center();
			const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 100 });
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			if (id === 'player1') {
				textMesh.rotation.set(-Math.PI / 2, 0, 0);
				textMesh.position.set(0, 0, 2);
			} else {
				textMesh.rotation.set(Math.PI / 2, Math.PI, 0);
				textMesh.position.set(0, 0, 2);
			}
			textMesh.name = id;
			playerUnit.add(textMesh);
		});
	}

	setTopView() {
		this.camera.position.set(0, 100, 0);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	shakeCamera(camera, duration = 100, intensity = 0.05) {
		const startTime = Date.now();
		const originalPosition = camera.position.clone();
		function shake() {
			const elapsedTime = Date.now() - startTime;
			if (elapsedTime < duration) {
				const progress = elapsedTime / duration;
				const xShake = (Math.random() - 0.5) * intensity * (1 - progress);
				const YShake = (Math.random() - 0.5) * intensity * (1 - progress);
				camera.position.x = originalPosition.x + xShake;
				camera.position.y = originalPosition.y + YShake;
				requestAnimationFrame(shake);
			} else {
				camera.position.copy(originalPosition);
			}
		}
		shake();
	}

	animateGame() {
		// 플레이어 위치 반영
		this.player1Unit.position.x = this.pongGameLogicInstance.player1.position.x;
		this.player2Unit.position.x = this.pongGameLogicInstance.player2.position.x;

		// 공 위치 반영
		this.ball.position.x = this.pongGameLogicInstance.ball.position.x;
		this.ball.position.z = this.pongGameLogicInstance.ball.position.z;

		// 충동시 화면 흔들림, 충격음
		if (this.pongGameLogicInstance.isWallStrike == true) {
			this.shakeCamera(this.camera, 200 ,4);
			this.pongGameLogicInstance.isWallStrike = false;
		}
		if (this.pongGameLogicInstance.isPlayer1Strike == true) {
			this.shakeCamera(this.camera, 500, 4);
			this.pongGameLogicInstance.isPlayer1Strike = false;
		}
		if (this.pongGameLogicInstance.isPlayer2Strike == true) {
			this.shakeCamera(this.camera, 300, 4);
			this.pongGameLogicInstance.isPlayer2Strike = false;
		}

		// Unit Animation
		let delta = this.clock.getDelta();
		if (this.player1UnitMixer) {
			this.player1UnitMixer.update(delta);
		}
		if (this.player2UnitMixer) {
			this.player2UnitMixer.update(delta);
		}
	}

	animate() {
		if (this.pongGameLogicInstance.isEnd == false) {
			requestAnimationFrame(this.animate);
		} else {
			// this.dispose();
			return ;
		}
		this.animateGame();
		if(this.pongGameLogicInstance.player1.userName && this.pongGameLogicInstance.player2.userName &&
			!this.scene.getObjectByName('player1') && !this.scene.getObjectByName('player2')) {
			this.playerNameTextureLoad(this.pongGameLogicInstance.player1.userName, 'player1', this.player1Unit);
			this.playerNameTextureLoad(this.pongGameLogicInstance.player2.userName, 'player2', this.player2Unit);
		}

		this.renderer.render(this.scene, this.camera);
	}

	async loop () {
		await this.animate();
	}

	removeEventListeners() {
		window.removeEventListener('resize', this.resizeListener);
	}

	disposeScene() {
		while (this.scene.children.length > 0) {
			const object = this.scene.children[0];
			this.scene.remove(object);

			if (object.geometry) {
				object.geometry.dispose();
			}
			if (object.material) {
				if (object.material instanceof Array) {
				object.material.forEach(material => material.dispose());
				} else {
					object.material.dispose();
				}
			}
			if (object.texture) {
				object.texture.dispose();
			}
		}
		  // 씬의 배경과 환경맵 제거
		if (this.scene.background) {
			this.scene.background.dispose();
		}
		if (this.scene.environment) {
			this.scene.environment.dispose();
		}
	}

	dispose() {
		this.isDisposed = true;
		this.disposeScene();
		this.removeEventListeners();
		// this.disposeAudio();

		if (this.renderer) {
			this.renderer.dispose();
		}
		if (this.pmremGenerator) {
			this.pmremGenerator.dispose();
		}
		if (this.renderer.domElement.parentNode) {
			this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
		}
	}
}
