import Component from "../../common/Component.js";
import { PongGame } from "../../pages/game/PongGame.js";
import { KeyboardController } from "../../pages/game/controller/KeyboardController.js";

export default class PongPage extends Component {
  setup() {

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


  initGame() {

  }

  componentDidMount() {
    setTimeout(()=>{
      this.startPongGame();
    }, 0);
  }

  async startPongGame(){
    const pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39, 38, 40, 32);
    const key2 = new KeyboardController(65, 68, 87, 83, 70);
    await pongGame.init(key1, key2, "Default", "Default", "pong-game-container");
    pongGame.start();
  }
}
