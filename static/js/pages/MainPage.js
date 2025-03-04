import Component from "../common/Component.js";
import CSSLaoder from '../common/CSSLoader.js';
import { LOGIN_COOKIE } from "../constants/constants.js";
import { MATH_FUNNEL_COMPONENT, MatchFunnel } from "../ui/MatchFunnel.js";

async function getUser() {
  const cookie = await cookieStore.get(LOGIN_COOKIE);
  if (!cookie) return null;
  return atob(cookie.value);
}


export default class MainPage extends Component {
  setup() {
    CSSLaoder.load('mainPage');
    this.$state = {
      username: null,
    };
    this.children = [{
        id: MATH_FUNNEL_COMPONENT.CONTAINER,
        type: MATH_FUNNEL_COMPONENT.Component,
      }]

    setTimeout(async()=>{
      const user = await getUser();
      this.setState({username: user});
    },0)
  }


  template() {
    const { username } = this.$state;

    return `
      <div id='main--div'>
        <div id="topNavBar">
          <div id="currentUserInfo">
            <div class="currentUserName">
              ${username ? `<p class="mb-0">${username}</p>` : '<p class="mb-0">Hello Fucking world</p>'}
            </div>
          </div>
        </div> 
        <div data-component="matchFunnel" id='matchButtonContainer'></div>
      </div>
    `;
  }
}

