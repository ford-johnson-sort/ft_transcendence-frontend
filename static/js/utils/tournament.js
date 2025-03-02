const SHUFFLE_TRIES = 8;

export default class Tournament {
  constructor(users){
    this.users = new Set(users);
    this.match = shuffle(users, SHUFFLE_TRIES)
      .map((i, idx, origin)=> {
        if(idx % 2 === 0){
          return [i, origin[idx+1]]
        }
      }).filter(i=>i);
  }


  *nextMatchGenerator() {
    for(let i = 0; i < this.match.length; i++) {
      yield this.match[i];
    }
  }

  addResult(winner){
    if(this._winner == null){
      this._winner = winner;
      return ;
    }
    if (this._winner) {
      this.match.push([this._winner, winner]);
      this._winner = null;
      return;
    }
  }
}

function shuffle(arr, n){
  let i = 0;
  while( i < n ) {
    arr.sort(()=>Math.random() - 0.5);
    i++;
  }
  return arr;
}

