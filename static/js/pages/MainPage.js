import Component from "../common/Component.js";
import CSSLaoder from '../common/CSSLoader.js';
import { MATH_FUNNEL_COMPONENT, MatchFunnel } from "../ui/MatchFunnel.js";

export default class MainPage extends Component {
  setup() {
    this.$state = {
      currentUser: { name: 'User', img: '/assets/default-profile.png', active: true },
      users: [], // 사용자 목록
      isLoading: true,
      error: null
    };

    CSSLaoder.load('mainPage');
    this.children = [{
        id: MATH_FUNNEL_COMPONENT.CONTAINER,
        type: MATH_FUNNEL_COMPONENT.Component,
      }]
  }


  template() {
    const { currentUser } = this.$state;

    return `
      <div id='main--div'>
        <div id="topNavBar">
          <div id="currentUserInfo">
            <div class="position-relative">
              <span class="status-indicator ${currentUser.active ? "online" : "offline"}"></span>
              <img src="${currentUser.img}" alt="User Profile" class="profile-img">
            </div>
            <div class="currentUserName">
              <p class="mb-0">${currentUser.name}</p>
            </div>
            <a href='/pong'>go pong</a>
          </div>
        </div>
        <div data-component="matchFunnel" id='matchButtonContainer'></div>
      </div>
    `;
  }
}


class PongManger {
  static _subscriber = new Set();

  static subscribe(fn) {
    this._subscriber.add(fn);
    return ()=>{
      this._subscriber.delete(fn);
    }
  }

  static notify(state) {
    for (const subscribe of this._subscriber){
      subscribe(state);
    }
  }
}

// PongManger.notify({status: 'end', winner: 'user 1'});
