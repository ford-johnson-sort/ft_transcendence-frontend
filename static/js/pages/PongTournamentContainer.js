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
    debugger;

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
    PongManager.subscribe(({ type, data })=> {
      if (type == GAME_MODE.END_GAME) {
        this.tournament.addResult(data.winner);
        const next = this.tournament.next();
        if (next.done) { 
          return ; 
        }
        this.setState({ currentMatch: next.value, isEnd: next.done, round: this.$state.round +1 });
      }}
    );
  }

  componentDidUpdate() {
    console.log(this.$state);
    if (!this.$state.isEnd) {
      PongManager.setState({
        matchType: MATCH_TYPE.TOURNAMENT,
        players: this.$state.currentMatch,
        round: this.$state.round
      })
      this.startPongGame();
    }
  }

  async startPongGame() {
    const pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39);
    const key2 = new KeyboardController(65, 68);
    await pongGame.init(key1, key2, "pong-game-container", MATCH_TYPE.TOURNAMENT);
    pongGame.start();
  }

  componentWillUnmount() {
    // this.unSubscribe();
  }
}
