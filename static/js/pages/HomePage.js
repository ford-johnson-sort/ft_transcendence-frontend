import Component from "../common/Component.js"
import CSSLaoder from "../common/CSSLoader.js"

export default class HomePage extends Component {
  setup() {
    CSSLaoder.load('loginPage');
  }

  template() {
    return `
      <div id='loginpage--container'>
        <h1 id="LoginHeader">ft_transcendence</h1>
        <div id="LoginPageDiv">
          <a class="btn btn-dark btn-lg" id="LoginButton" href='/main'>START</a>
          <footer id="LoginFooter">Transcendence</footer>
        </div>
      </div>
    `;
  }

}
