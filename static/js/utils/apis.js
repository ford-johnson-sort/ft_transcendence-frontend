import {mockUsers} from './mock.js'



export const UserApi = {
	async getUsers() {
		// const response = await fetch('/users')
		// const users = response.json();
		// return  users;
		return new Promise((resolve)=>{
			setTimeout(()=>{
				resolve(mockUsers);
			}, 1000);
		})
	}
}
