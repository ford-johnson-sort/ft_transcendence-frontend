import { loginPage } from './pages/loginPage.js';
import { mainPage } from './pages/mainPage.js';
import { notFoundPage } from './pages/notFoundPage.js';
import { pongPage } from './pages/pongPage.js';
import { loadPageCss } from './utils/loadPageCss.js';

export class Router {
	constructor() {
		this.routes = [
			{ path: '/', view: loginPage},
			{ path: '/login', view: loginPage },
			{ path: '/main', view: mainPage},
			{ path: '/pong', view: pongPage}
		];
		this.route = this.route.bind(this);

		window.addEventListener('popstate', this.route); // 뒤로 가기, 앞으로 가기 처리
		window.addEventListener('DOMContentLoaded', this.route); // 새로고침 또는 처음 페이지 로드 시 실행
	}
	async route() {
		let path = window.location.pathname;
		if (path === '/index.html') {
			path = '/'; // index.htmldmf '/'로 변환
		}
		const match = this.routes.find(route => route.path === path);
		console.log("현재 경로:", path);

		const view = match ? match.view : notFoundPage;

		if (view.css) {
			loadPageCss(view.css);
		}
		const root = document.getElementById('root');
		root.innerHTML = '';
		root.appendChild(await view.render());
	}
	/**
	 *
	 * @param {string} url
	 */
	async navigateTo(url) {
		history.pushState({}, '', url);
		await this.route();
	}
}
