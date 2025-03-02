import Component from "../../common/Component.js";

export default class NotFoundPage extends Component {
  template() {
    return `
      <div id="LoginPageDiv">
        <h1>404 - Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button class="btn btn-primary" id="goBackButton">Go Back Home</button>
      </div>
    `;
  }
  
  setEvent() {
    // 홈으로 돌아가기 버튼
    const goBackButton = this.$target.querySelector('#goBackButton');
    if (goBackButton) {
      goBackButton.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }
}
