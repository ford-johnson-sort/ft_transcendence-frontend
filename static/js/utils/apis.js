

export const AuthAPi = {
	refresh(){
		return fetch('/auth/user/refresh', {
			method: 'POST'});
	},

	async whoami(){
		try{
			const response = await fetch('/auth/user/whoami');
			const data = await response.json();
			const {result, exp} = data;
			if (result && new Date(now) < new Date((exp * 1000) + (1 * 60 * 60 * 1000))){
				const refresh = await this.refresh();
				if (refresh.status === 200){
					return {result: true};
				}
			}
			return result;
		} catch(e) {
			console.log(e);
		}
	}
}

export const GameApi = {
	async match() {
		const response = await fetch('/game/pong/new', {method: 'POST'});
		return response.json();
	}
}
