import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { GAME_MODE } from "../constants/constants.js";
import { GameApi } from "../utils/apis.js"

export default class RemotePlayPong extends Component {
  setup() {
    CSSLaoder.load('pongPage');
    const {matchType} = this.$props.params;
    if (matchType !== GAME_MODE.REMOTE) {
      // TODO : 전역 모달 열어서 메시지 안내 후,  redirect
      return ;
    }

    this.unSubscribe = PongManager.subscribe(this.subscribe);
  }

  subscribe({mode, data}){ // data -> {[key:string]:}
    // if(mode === 'READY'){
      // this.startPong();
    // }
    console.log('listsen Remote', message);
  }

  prepare = async () => {
    const {result, username, room_uuid, error} = await GameApi.match();
    if (!result) {
      throw new Error(error);
    }
    PongManager.setState({
      matchType: GAME_MODE.REMOTE,
      roomID: room_uuid,
      username
    });
  }

/*
  remote username이 없어 -> 근데 어짜피 우리 점수 띄워야함
  animate에서 걍 '' 했다가 username 추적하고 userScore 그러면 스코어도 띄울수 있음 ->
  fontloader를 animate에 박아버리자 -> 그러면 animate에서 바로 띄울수 있음
*/

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
        this.preparePong();
      } catch(e){

      }
    }, 0);
  }

  async preparePong(){
    this.pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39, 38, 40, 32);
    const key2 = new KeyboardController(65, 68, 87, 83, 70);
    await this.pongGame.init(key1, key2, "pong-game-container", this.$state.matchType);
    this.startPong();
  }

  startPong(){
    this.pongGame.start();
  }

  componentWillUnmount(){
    this.unSubscribe();
  }
}
