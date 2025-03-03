import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { MATCH_TYPE } from "../constants/constants.js";
import Tournament from '../utils/tournament.js';
import {Router} from '../common/Router.js';

export default class PongPage extends Component {
  setup() {
    CSSLaoder.load('pongPage');
    const {matchType} = this.$props.params;
    if ([MATCH_TYPE.ONE_ON_ONE, MATCH_TYPE.TOURNAMENT].some(type=> type === matchType)) {
      const players = JSON.parse(localStorage.getItem('playerNames') || '[]');

      this.$state = { players, matchType };
    }
    const subscribe = (message) => {
      console.log(message);
    }
    PongManager.setUser([...this.$state.players]);
    this.unSubscribe = PongManager.subscribe(subscribe);
  }

  template() {
    return `
    <div data-component="PongManager"></div>
    <div id='pong-game-container'>
        <div id="pongCanvas"></div>
    </div>
    `;
  }

  setEvent() {

  }

  componentDidMount() {
    PongManager.subscribe(({type, data})=>{
      if (type == 'GAME_END') {
        const wrapper = document.querySelector('div[data-component="PongManager"]');
        wrapper.setAttribute('class', type);
        wrapper.innerHTML = `
        <div>
          <div class="vibration">
            <p>${data.winner}</p>
          </div>
          <button class='newGame'>NEW GAME</button>
          </div>
          <audio class='audio hidden' src="/static/assets/sound/And His Name is JOHN CENA - Sound Effect (HD).mp3" controls autoplay></audio>
        </div>`;
        wrapper.addEventListener('click', (e)=>{
          if(e.target.closest('.restart')){
            this.wrapper.innerHTML= '';
            return this.startPongGame();
          }
          if (e.target.closest('.newGame')){
            return Router.push('/main');
          }
        })
      }
    });

    setTimeout(()=>{
      this.startPongGame();
    }, 0);
  }



  componentWillUpdate(){}

  async startPongGame(){
    const pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39, 38, 40, 32);
    const key2 = new KeyboardController(65, 68, 87, 83, 70);
    await pongGame.init(key1, key2, "pong-game-container", this.$state.matchType);
    pongGame.start();
  }

  componentWillUnmount(){
    this.unSubscribe();
  }
}
