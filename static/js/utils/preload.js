import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export class Preload {
	static camera;
	static renderer;
	static pmremGenerator;
	static RGBELoader;

	static createCamera(
		fov = 90,
		aspect = window.innerWidth / window.innerHeight,
		near = 0.1,
		far = 1000,
		position = { x: 0, y: 40, z: 100 },
		lockAt = new THREE.Vector3(0, 0, 35)
	) {
		const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(position.x, position.y, position.z);
		camera.lookAt(lockAt);
		Preload.camera = camera;
		return camera;
	};

	static createRenderer(
		antialias = true,
		alpha = false,
		precision = "lowp",
		powerPreference = "high-performance"
	) {
		const renderer = new THREE.WebGLRenderer({ antialias, alpha, precision, powerPreference });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 2.0;
		Preload.renderer = renderer;
		return renderer;
	};

	static createPmremGenerator() {
		const pmremGenerator = new THREE.PMREMGenerator(Preload.renderer);
		pmremGenerator.compileEquirectangularShader();
		Preload.pmremGenerator = pmremGenerator;
		return pmremGenerator;
	};
}


(function init() {
	if (!Preload.camera)
		Preload.createCamera();
	if (!Preload.renderer)
		Preload.createRenderer();
	if (!Preload.pmremGenerator)
		Preload.createPmremGenerator();
	if (!Preload.RGBELoader)
		Preload.RGBELoader = new RGBELoader();
}) ();
