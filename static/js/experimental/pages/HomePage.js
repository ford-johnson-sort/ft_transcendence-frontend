import Component from "../../common/Component.js"
import CSSLaoder from "../../common/CSSLoader.js"

export default class HomePage extends Component {
  setup() {
    CSSLaoder.load('loginPage');
  }

  async checkLoginStatus() {
    //TODO: server 로그이상태 가져오기

    const isLoggedIn = false;
    this.setState({ isLoggedIn });
  }

  template() {
    return `
      <div id='loginpage--container'>
        <h1 id="LoginHeader">ft_transcendence</h1>
        <div id="LoginPageDiv">
          <a class="btn btn-dark btn-lg" id="LoginButton" href='/'>LOGIN</a>
          <footer id="LoginFooter">Transcendence</footer>
        </div>
      </div>
    `;
  }

  setEvent() {
    // 로그인 버튼 클릭 이벤트 처리
    const loginButton = this.$target.querySelector('#LoginButton');
    if (loginButton) {
      loginButton.addEventListener('click', this.handleLogin.bind(this));
    }
  }


}
