import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { GAME_MODE, MATCH_TYPE } from "../constants/constants.js";
import Tournament from "../utils/tournament.js";
import { Router } from "../common/Router.js";
import PongManagerView from "../ui/PongManagerView.js";

const TOURNAMENT = Object.freeze({
  USER_SIZE: 4
});

export default class PongTournamentContainer extends Component {
  setup() {
    
    const players = PongManager.getPlayers();
    if (players.length != TOURNAMENT.USER_SIZE) {
      return Router.push("/main");
    }

    this.tournament = new Tournament(players);
    PongManager.resetPlayers();
    const {value, done} = this.tournament.next();

    this.setState({
      currentMatch: value,
      round: 1,
      isEnd: done ?? true,
    })
    
  }

    template() {
      return `
        <div id="pong-game-container">
          <div id="pongCanvas"></div>
        </div>
      `;
  }

  componentDidMount() {
    this.unsub = PongManager.subscribe(({ type, data })=> {
      if (type == GAME_MODE.END_GAME) {
        this.tournament.addResult(data.winner);
        const next = this.tournament.next();
        if (next.done) { 
          return ; 
        }
        this.setState({ currentMatch: next.value, isEnd: next.done, round: this.$state.round +1 });
        setTimeout(()=>{
          PongManager.notify({
            type: GAME_MODE.WAIT,
            data:{
              start:()=> this.pongGame.start(),
              message: `ROUND ${this.$state.round} match ${this.$state.currentMatch.join(' vs ')}`
            }
          });
        }, 2000);
        
      }}
    );
  }

  componentDidUpdate() {
    if (!this.$state.isEnd) {
      PongManager.setState({
        matchType: MATCH_TYPE.TOURNAMENT,
        players: this.$state.currentMatch,
        round: this.$state.round
      })
      if(!this.pongGame){
        this.preparePong();
        PongManager.notify({
            type: GAME_MODE.WAIT,
            data:{
              start:()=> this.pongGame.start(),
              message: `ROUND ${this.$state.round} match ${this.$state.currentMatch.join(' vs ')}`
            }
        });
      }
      this.preparePong();
    }
  }

  async preparePong() {
    this.pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39);
    const key2 = new KeyboardController(65, 68);
    await this.pongGame.init(key1, key2, "pong-game-container", MATCH_TYPE.TOURNAMENT);
    // this.pongGame.start();
  }

  componentWillUnmount() {
    this.pongGame.destroy();
    this.unsub();
  }
}
