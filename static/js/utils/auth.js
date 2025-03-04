import {LOGIN_COOKIE} from '../constants/constants.js';

export default function isLogin() {
	if(getCookie(LOGIN_COOKIE)){
		return true;
	}
	return false;
}

export function getCookie(name) {
	let cookie = document.cookie.split('; ')
		.map((c) => {return c.split('=')})
		.filter((c) => {return c[0] == name});
	return cookie.length == 1 ? cookie[0][1] : null;
}
