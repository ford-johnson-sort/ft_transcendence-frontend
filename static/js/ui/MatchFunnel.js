import Component from "../common/Component.js";

export const MATCH_FORM_SELECTOR = '.match-form';
const GAME_MODE = Object.freeze({
  LOCAL: 'local',
  ONE_ON_ON: '1on1',
  REMOTE: 'remote',
  TOURNAMENT: 'tournament'
});


export class MatchFunnel extends Component {
  setup() {
    this.$state = {
      currentStep: 1,
      matchType: null
    };

    this.handleClick = (e) => {
      e.stopPropagation();
      const matchButton = e.target.closest('.matchButton');
      if (matchButton) {
        return this.onClickMatchButton(matchButton);
      }
      if (e.target.classList.contains('back-button')) {
        return this.goToPreviousStep();
      }
    }
  }

  template() {
    const { currentStep } = this.$state;
    console.log('currnetStep', currentStep);
    return `
      <div class="funnel-container">
        ${currentStep === 1 ? this.renderStep1() : ''}
        ${currentStep === 2 ? this.renderStep2() : ''}
        ${currentStep === 3 ? this.renderStep3() : ''}
      </div>
    `;
  }

  renderStep1() {
    return `
      <div data-funnelstep="1" class="funnel-step">
        <div class='funnel-header'>
          <h3>Select Game Type</h3>
        </div>
        <div class="button-container">
          <button class="btn btn-success matchButton" data-match-type="${GAME_MODE.LOCAL}">LOCAL PLAY</button>
          <button class="btn btn-success matchButton" data-match-type="${GAME_MODE.REMOTE}">REMOTE PLAY</button>
        </div>
      </div>
    `;
  }

  renderStep2() {
    return `
      <div data-funnelstep="2" class="funnel-step">
        <div class='funnel-header'>
          <h3>Select Match Type</h3>
          <button class="btn btn-secondary back-button">Back</button>
        </div>
        <div class="button-container">
          <button class="btn btn-success matchButton" data-match-type="${GAME_MODE.ONE_ON_ON}">1 VS 1</button>
          <button class="btn btn-success matchButton" data-match-type="${GAME_MODE.TOURNAMENT}">TOURNARMENT PLAY</button>
        </div>
      </div>
    `;
  }

  renderStep3() {
    return `
      <div data-funnelstep="3" class='funnel-step'>
        <div class='funnel-header'>
          <h3>Make match</h3>
          <button class="btn btn-secondary back-button">Back</button>
        </div>
        <form class='match-form'>
        ${"<input type='text' class='match-user'></input>".repeat(this.$state.matchUserAmount)}
        </form>
      </div>
    `;
  }

  setEvent() {
    console.log('setup event');
    this.$target.addEventListener('click', this.handleClick);
    if (this.$state.currentStep === 3){
      console.log('here');
      const form = this.$target.querySelector(MATCH_FORM_SELECTOR);
      if(form){
        form.addEventListener('keypress', this.handleKeyPress);
        form.addEventListener('submit', this.handleFormSubmit);
      }
    }
  }

  onClickMatchButton(button) {
    const matchType = button.dataset.matchType;
    const { currentStep } = this.$state;
    console.count('fire')
    if(matchType === GAME_MODE.REMOTE){
      return this.startGame({matchType});
    }
    if(matchType === GAME_MODE.ONE_ON_ON){
      return this.setState({matchType, matchUserAmount: 2, currentStep: currentStep+1});
    }
    if(currentStep === 2 && matchType === GAME_MODE.TOURNAMENT){
      this.setState({currentStep:currentStep+1, matchUserAmount: 4, matchType});
    }
    return this.setState({currentStep: currentStep+1 });
  }

  handleFormSubmit = (e) =>{
    e.preventDefault();
    const userInputs = this.$target.querySelectorAll('.match-user');
    const allFilled = Array.from(userInputs).every(input => input.value.trim() !== '');
    if (allFilled) {
      const names = Array.from(userInputs).map(input => input.value.trim());
      if (new Set(names).size !== names.length){
        return alert('중복된 이름이 있습니다.');
      }
      localStorage.setItem('playerNames', JSON.stringify(names));
      return this.startGame({matchType: this.$state.matchType});
    }
    alert('모든 유저의 필드를 채워주세용');
  }

  handleKeyPress = (e) =>{
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = this.$target.querySelectorAll('.match-user');
      const currentInput = document.activeElement;
      const currentIndex = Array.from(inputs).indexOf(currentInput);
      if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else if (currentIndex === inputs.length - 1) {
        this.handleFormSubmit(e);
      }
    }
  }

  goToPreviousStep() {
    this.setState({currentStep: Math.max(1, this.$state.currentStep - 1)});
  }

  startGame({matchType}) {
    window.location.href = `/pong/${matchType}`;
  }

  componentWillMount(){
    this.$target.removeEventListener('click', this.handleClick);
    const form = this.$target.querySelector(MATCH_FORM_SELECTOR);
    if (form) {
      form.removeEventListener('submit', this.handleFormSubmit);
      form.removeEventListener('kyepress', this.handleKeyPress);
    }

  }
}


export const MATH_FUNNEL_COMPONENT = {
  CONTAINER: 'matchFunnel',
  Component: MatchFunnel,
}
