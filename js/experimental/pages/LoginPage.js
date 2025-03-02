import Component from "../../common/Component.js";

export default class LoginPage extends Component {
  setup() {
    this.$state = {
      isLoggedIn: false // 로그인 상태 관리
    };
    
    // 로그인 상태 확인 (실제로는 서버 API 또는 토큰 확인)
    this.checkLoginStatus();
  }
  
  async checkLoginStatus() {
    // 실제로는 토큰 확인 또는 서버 API 호출
    // 예: const isLoggedIn = localStorage.getItem('token') !== null;
    const isLoggedIn = false; // 목업 데이터
    
    this.setState({ isLoggedIn });
  }
  
  template() {
    return `
      <div id='loginpage--container'>
        <h1 id="LoginHeader">ft_transcendence</h1>
        <div id="LoginPageDiv">
          <button class="btn btn-dark btn-lg" id="LoginButton">LOGIN</button>
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
  
  handleLogin() {
    // 이미 로그인된 상태인지 확인
    if (this.$state.isLoggedIn) {
      // 메인 페이지로 이동
      window.location.href = '/main';
    } else {
      // OAuth 인증 페이지로 이동
      window.location.href = '/auth/oauth';
    }
  }
}