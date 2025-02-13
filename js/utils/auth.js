import { LOGIN_COOKIE } from '../constants/constants.js';

export default function isLogin() {
	let userData = parseJWT();

	console.log(userData);
	if(getCookie(LOGIN_COOKIE)){
		return true;
	}
	return false;
}


function getCookie(name) {
	let cookie = document.cookie.split('; ')
		.map((c) => {return c.split('=')})
		.filter((c) => {return c[0] == name});
	return cookie.length == 1 ? cookie[0][1] : null;
}

function parseJWT() {
	let jwt = getCookie(LOGIN_COOKIE);
	console.log("after GetCookie");
	if (!jwt) {
		console.log("JWT NULL");
		return null; // 쿠키가 없으면 null 반환
	}
	try {
		let payload = JSON.parser(atob(jwt.split('.')[1]));
		console.log(payload);
		return payload;
	} catch (error) {
		console.error("JWT Parsing Error:", error);
		return null;
	}
}
