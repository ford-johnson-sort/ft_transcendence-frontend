import { Router } from './router.js';

const router = new Router();

window.navigateTo = (path) => {
	router.navigateTo(path);
}
