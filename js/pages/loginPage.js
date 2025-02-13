import isLogin from '../utils/auth.js';

export const loginPage = {
	render() {
		const container = document.createElement('div', {id: "loginpage--container"});
		// const container = document.querySelector('#root');
		// container.setAttribute('id', 'loginpage--container')
		// SPA -> 없던 걸 만들어야 해~~
		// <div root> -> 뭔가를 덧붙여.
		// 문서에 바로 반영되지 않는다.
		container.innerHTML = `
				<h1 id="LoginHeader">ft_transcendence</h1>
				<div id="LoginPageDiv">
					<button class="btn btn-dark btn-lg" id="LoginButton">LOGIN</button>
					<footer id="LoginFooter">Transcendence</footer>
				</div>
		`;
		console.log('hi');
		console.log(document);
		const loginButton = container.querySelector('#LoginButton');
		console.log(loginButton);
		if (loginButton) {
			// Auth 인증 신청 GetToken();
			loginButton.addEventListener('click', () => {
				console.log('Login 버튼 클릭: /main 으로 이동')
			if (isLogin())
				window.navigateTo('/main');
			else
				window.navigateTo('/');
			});
		}
		return container;
	},
	css: 'styles/css/loginPage.css'
};
