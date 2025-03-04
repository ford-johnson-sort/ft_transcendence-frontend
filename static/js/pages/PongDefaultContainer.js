import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { MATCH_TYPE } from "../constants/constants.js";
import { Router } from '../common/Router.js';

/**
 * PongPage => DefaultPong
 */
export default class PongDefaultContainer extends Component {
  setup() {

    const players = PongManager.getPlayers();
    if (players.length != 2) {
      PongManager.resetPlayers();
      Router.push('/main');
    }
    PongManager.resetPlayers();
    this.setState({ players });
  }

  template() {
    return `
      <div id='pong-game-container'>
        <div id="pongCanvas"></div>
      </div>
    `;
  }

  setEvent() {

  }

  componentDidMount() {
  }
  
  componentDidUpdate() {
    if(!this.$state.players || this.$state.players.length !=2){
      return ;
    }
    PongManager.setState({
      matchType: MATCH_TYPE.ONE_ON_ONE,
      players: this.$state.players
    })
    this.initPongGame();
    PongManager.notify({
      type: 'WAIT',
      data: {
        onClick: ()=>this.pongGame.start(),
        message: "게임 스타트"
      },
    })
    }
    

  async initPongGame(){
    this.pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39);
    const key2 = new KeyboardController(65, 68);
    await this.pongGame.init(key1, key2, "pong-game-container", MATCH_TYPE.ONE_ON_ONE);
  }

  componentWillUnmount(){
    this.pongGame.destroy();
  }
}
