export default class PongManger {
	static _subscriber = new Set();

	static subscribe(fn) {
	  this._subscriber.add(fn);
	  return ()=>{
		this._subscriber.delete(fn);
	  }
	}

	static notify(state) {
	  for (const subscribe of this._subscriber){
		subscribe(state);
	  }
	}
  }
