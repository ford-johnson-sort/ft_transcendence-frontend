import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { PongGame } from './game/PongGame.js';
import { Controller } from './game/controller/Controller.js';
import { KeyboardController } from './game/controller/KeyboardController.js';
// TODO: Logic 분리 요망

let player1Unit, player2Unit;
let ballVelocity = { x: 0, z: 1.8};
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

async function startPongGame() {
	const pongGame = new PongGame();
	const key1 = new KeyboardController(37, 39, 38, 40, 32);
	const key2 = new KeyboardController(65, 68, 87, 83, 70);
	await pongGame.init(key1, key2, "Default", "Default", "pong-game-container");
	pongGame.start();
}
