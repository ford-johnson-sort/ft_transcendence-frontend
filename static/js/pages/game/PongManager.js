import { PLAYER_NAMES, MATCH_TYPE } from "../../constants/constants.js";
export default class PongManager {
	static _subscriber = new Set();
	static _state = {};

	static subscribe(fn) {
	  PongManager._subscriber.add(fn);
	  return ()=> {
			PongManager._subscriber.delete(fn);
	  }
	}

	static notify(state) {
	  for (const fn of PongManager._subscriber){
			fn(state);
	  }
	}

	static getUser() {
		return PongManager._user;
	}

	static setUser(users) {
		PongManager._user = users;
	}

	/**
	 * 
	 * @param {{
	 * matchType: keyof MATCH_TYPE,
	 * [K: string]: any,
	 * }} state 
	 */
	static setState(state) {
		const { matchType, ...other } = state;
		PongManager._state = {
			...PongManager._state, 
			[matchType]: {...PongManager._state[matchType], ...other}
		};
	}



	static getState({ matchType }) {
		//-> {matchType:string}
		return PongManager._state[matchType];
	}

	/**
	 * 
	 * @returns {Array<string>}
	 */
	static getPlayers() {
		return JSON.parse(localStorage.getItem(PLAYER_NAMES) ?? "[]");
	}

	static resetPlayers(){
		localStorage.removeItem(PLAYER_NAMES);
	}
}

/*
	지금 Logic을 Local Logic과 Remote Logic
	REMOTE주면 Game Logic 부분을 REMOTE로 바꿔주고
	Remote Logic에서는 uuid를 받아서 setting 후
	서버에서 받아온 데이터로 Logic이 가지고 있는 데이터를 변경 하는 방식으로 진행
	KeyboradController를 사용하는 것이 아니라 uuid랑 username받으니까
	초기 세팅하고
	통신해서 data setting하고
	게임 시작
	게임 종료
	TODO: Local Logic과 Remote Logic을 분리해서 작성
	KET_EVENT를 사용하는 부분을 수정
	Remote Logic에서는 KeyboardController를 사용하지 않음
	Controller를 상속받아서 재정의
	RemoteKeyboardController를 만들어서 사용
*/

// PongGame => PongMagner.getUser(); -> 초기에 유저 정보얻얻기

