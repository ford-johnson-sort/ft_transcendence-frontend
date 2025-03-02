import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManger from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js";

export default class PongPage extends Component {
  setup() {
    console.log('setup',this.$props.params);
    const players = JSON.parse(localStorage.getItem('playerNames') || '[]');
    console.log(players);
    CSSLaoder.load('pongPage');
    // localStorage.removeItem('playerNames');
    // this.children = [{

    // }]
  }

  template() {
    return `
    <div data-component="waitWrapper"></div>
    <div id='pong-game-container'>
        <div id="pongCanvas"></div>
    </div>
    `;
  }

  setEvent() {

  }


  componentDidMount() {
    console.log(this.$props.params);
    PongManger.subscribe(({type, data})=>{
      if (type == 'GAME_END') {
        const wrapper = document.querySelector('div[data-component="waitWrapper"]');
        wrapper.setAttribute('class', type);
        wrapper.innerHTML = data.winner;
      }

      this.setState({sex: data.winner});
    });

    setTimeout(()=>{
      this.startPongGame();
    }, 0);
  }



  componentWillUpdate(){
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
