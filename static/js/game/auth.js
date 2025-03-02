const COOKIE_NAME = 'merge-insertion-sort';
function getCookie(name) {
  let cookie = document.cookie.split('; ')
    .map((c) => { return c.split('=') })
    .filter((c) => { return c[0] == name });
  return cookie.length == 1 ? cookie[0][1] : null;
}

export {COOKIE_NAME, getCookie};
