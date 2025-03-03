import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManger from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { GAME_MODE } from "../constants/constants.js";
import { GameApi } from "../utils/apis.js"

export default class RemotePlayPong extends Component {
  setup() {
    CSSLaoder.load('pongPage');
    const {matchType} = this.$props.params;
    if (matchType !== GAME_MODE.REMOTE) {
      // TODO : 전역 모달 열어서 섹스하기
      return ;
    }

    this.unSubscribe = PongManger.subscribe(this.subscribe);
  }

  subscribe = (message) => {
    console.log('listsen Remote', message);
  }

  prepare = async () => {
    const {result, username, room_uuid, error} = GameApi.match();
    if (!result) {
      throw new Error(error);
    }
    PongManger.setState({
      matchType: GAME_MODE.REMOTE,
      roomID: room_uuid,
      username
    });
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
    console.log(this.$props.params);

    setTimeout(async ()=>{
      try{
        await this.prepare();
        this.startPongGame();
      } catch(e){

      }
    }, 0);
  }

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
