import { Router } from './router.js';
import isLogin from './utils/auth.js';

const router = new Router();

window.navigateTo = (path) => {
	router.navigateTo(path);
}


