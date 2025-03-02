export function loadPageCss(cssPath) {
	if (document.querySelector(`link[href="${cssPath}"]`))
		return ;

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = cssPath;
	document.head.appendChild(link);
}
