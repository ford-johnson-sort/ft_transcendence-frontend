import {getCookie, COOKIE_NAME} from './auth.js'

const authDOM = document.getElementById('auth');

if (getCookie(COOKIE_NAME) == null) {
  authDOM.style.visibility = 'visible';
} else {
  authDOM.style.visibility = 'hidden';
}
