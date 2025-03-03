export default class PongManger {
	static _subscriber = new Set();
	static _state = {};

	static subscribe(fn) {
	  PongManger._subscriber.add(fn);
	  return ()=> {
			PongManger._subscriber.delete(fn);
	  }
	}

	static notify(state) {
	  for (const fn of PongManger._subscriber){
			fn(state);
	  }
	}

	static getUser() {
		return PongManger._user;
	}

	static setUser(users) {
		PongManger._user = users;
	}

	static setState(state) {
		PongManger._state = {...PongManger._state, ...state};
	}

	static getState(){
		return PongManger._state;
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
//  PongGAme => PongManger.notify(message) // mode WATI, REDADY, GAME_END
