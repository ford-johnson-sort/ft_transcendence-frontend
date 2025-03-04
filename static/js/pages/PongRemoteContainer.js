import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { PongGame } from "./game/PongGame.js";
import PongManager from "./game/PongManager.js";
import { KeyboardController } from "./game/controller/KeyboardController.js"
import { GAME_MODE, MATCH_TYPE } from "../constants/constants.js";
import { GameApi } from "../utils/apis.js"
import { ResponseError } from "../constants/error.js"
import { Router } from "../common/Router.js";

export default class PongRemoteContainer extends Component {

  prepare = async () => {
    const { username, room_uuid, error} = await GameApi.match();
    if (room_uuid && username){
      PongManager.setState({
        matchType: MATCH_TYPE.REMOTE,
        roomID: room_uuid,
        username
        });
    }
  }

  template() {
    return `
      <div id='pong-game-container'>
        <div id="pongCanvas"></div>
      </div>
    `;
  }


  componentDidMount() {
    setTimeout(async ()=>{
      try{
        await this.prepare();
        this.preparePong();
      } catch(error){
        if (error instanceof TypeError) {
          PongManager.notify({ type: "ERROR", error });
          return;
        }
        if (error instanceof ResponseError) { // 401 & 405
          //TODO: 전역 modal혹은 Toast로 변경필요
          PongManager.notify({ type: 'ERROR', error});
          setTimeout(()=>{
            location.href = '/auth/oauth/';
          }, 3000);
          return ;
        }
        console.log(error);
      }
    }, 0);
    console.log('mounted', this);
  }

  async preparePong(){
    this.pongGame = new PongGame();
    const key1 = new KeyboardController(37, 39);
    await this.pongGame.init(key1, null, "pong-game-container", MATCH_TYPE.REMOTE);
    this.pongGame.start();
  }

  componentWillUnmount(){
    console.log('unmount', this.className);
    this.pongGame.destroy();
  }
}
