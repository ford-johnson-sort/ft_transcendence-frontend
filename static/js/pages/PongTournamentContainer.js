import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { MATCH_TYPE } from "../constants/constants.js";
import Tournament from "../utils/tournament.js";
import { Router } from "../common/Router.js";
import PongManagerView from "../ui/PongManagerView.js";

const TOURNAMENT = Object.freeze({
  USER_SIZE: 4
});


export default class PongTournamentContainer extends Component {
  setup() {
    CSSLaoder.load("PongPage");
    const players = JSON.parse(localStorage.getItem('playerNames') ?? '[]');
    PongManager.setUser([...players]);
    if (players.length != TOURNAMENT.USER_SIZE) {
      alert("유저 섹스");
      Router.push("/main");
    }
    this.tournament = new Tournament(players);
    const {value, done} = this.tournament.next();

    this.setState({
      currentMatch: value,
      isEnd: done ?? true,
    })
    
  }

    template() {
    return `
    <div data-component="PongManager"></div>
    <div id="pong-game-container">
        <div id="pongCanvas"></div>
    </div>
    `;
  }

  setEvent() {

  }

  componentDidMount() {
    PongManager.subscribe(({ type, data })=> {
      if (type == "GAME_END") {
        console.log(data);
        this.tournament.addResult(data.winner);
        const next = this.tournament.next();
        if (next.done) {
          return ;
        }
        this.setState({ currentMatch: next.value, isEnd: next.done });
      }}
    );
  }

  componentDidUpdate() {
    console.log(this.$state);
    if (!this.$state.isEnd) {
      // PongManager.setState({
        // matchType: 
      // })
      // PongManager.
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
