

export class notFoundPage {
	render() {
		const container = document.createElement('div');
		container.innerHTML = `
			<div id="LoginPageDiv">
				<h1>404 - ot Found</h1>
			</div>
		`;
		return container;
	}
};
