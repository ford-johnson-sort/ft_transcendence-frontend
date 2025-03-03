import Component from "../common/Component.js";
import CSSLaoder from "../common/CSSLoader.js";
import { Router } from "../common/Router.js";

const MESSAGES = {
  AUTH: {
    HEADER: "1단계 인증 성공 ✅",
    DESCRIPTION: "메일 인증을 완료해주세요.\n인증을 완료하시면 메인화면으로 이동합니다."
  }
}



export default class AuthCallback extends Component {
  setup(){
    CSSLaoder.load('authCallbackPage');
  }

  setEvent() {
    window.cookieStore.addEventListener('change', async (event)=>{
      const cookie = await cookieStore.get('merge-insertion-sort');
      if (cookie) {
        Router.push('/main');
      }
    })
  }


  template(){
    return `
    <main id="authpage--main">
      <div id="authpage--message--container">
        <header id='auth--header'>
          <h1>${MESSAGES.AUTH.HEADER}</h1>
        </header>
        <p id='auth--description'>${MESSAGES.AUTH.DESCRIPTION}</p>
      </div>
    </main>

    `
  }
}
