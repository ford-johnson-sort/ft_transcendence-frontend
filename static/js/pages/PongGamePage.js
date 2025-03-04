import CSSLaoder from "../common/CSSLoader.js";
import Component from "../common/Component.js";
import { GAME_MODE, MATCH_TYPE } from "../constants/constants.js";
import PongManagerView from "../ui/PongManagerView.js";
import PongTournamentContainer from "./PongTournamentContainer.js";
import PongDefaultContainer from "./PongDefaultContainer.js";
import PongRemoteContainer from "./PongRemoteContainer.js";
import PongManager from "./game/PongManager.js";
import { Router } from "../common/Router.js";

/**
 * PongPage => DefaultPong
 */
const GameContainers = {
  [MATCH_TYPE.TOURNAMENT]: PongTournamentContainer,
  [MATCH_TYPE.ONE_ON_ONE]: PongDefaultContainer,
  [MATCH_TYPE.REMOTE]: PongRemoteContainer
};


export default class PongGamePage extends Component {
  setup() {
    CSSLaoder.load('pongPage');
    const {matchType} = this.$props.params;
    console.log(matchType);
    console.log(GameContainers[matchType])
  
    this.children = [
      {
        id: 'PongGameContainer',
        type: GameContainers[matchType],
      },
      {
        id: 'PongManagerView',
        type: PongManagerView,
        props: {
          matchType
        }
      }
    ]
  }

  template() {
    return `
      <div data-component="PongManagerView"></div>
      <div data-component="PongGameContainer"></div>
    `;
  }

  setEvent() {}

  componentDidMount() {

  }

  componentWillUnmount(){

  }
}
