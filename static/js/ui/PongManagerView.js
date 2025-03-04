import Component from "../common/Component.js";
import { Router } from "../common/Router.js";
import { GAME_MODE, MATCH_TYPE } from "../constants/constants.js";
import PongManager from "../pages/game/PongManager.js";
import Tournament from "../utils/tournament.js";

function getournamentText(round, winner){
  if (round !== 3){
    return `🏁 ROUND ${round} WINNER 🏁\n 🔥${winner}`
  }
  return `🔥🔥🔥🔥🔥MATCH WINNER🔥🔥🔥🔥🔥\n\n ${winner}`;
}



export default class PongManagerView extends Component {
  setup(){
    this.unsubscribe = PongManager.subscribe(({type, data = {}})=>{
      console.log(type, data);
      if (type === GAME_MODE.WAIT && data?.onClick){
        this.setState({type, onClick: data?.onClick , message: data.message});
      }
      if (type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.TOURNAMENT){
        const { round } =  PongManager.getState({matchType: this.$props.matchType});
        this.setState({type, data: {message: getournamentText(round, data.winner), round}});
      }
    });

  }


  componentDidUpdate(){
    console.log(this.$state);
    if(this.$state.type === GAME_MODE.WAIT && this.$state.onClick){
      const {onClick} = this.$state;
      this.$target.addEventListener('click', (e)=>{
        if(e.target.closest('.wait-callback')){
          const conatiner = document.querySelector('.message-container');
          conatiner.setAttribute('class', 'd-none');
          onClick();
        }
      });
    }

    if (this.$state.type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.TOURNAMENT) {
      if (this.$state.data.round !== 3) {
        setTimeout(()=>{
          const container = document.querySelector('.message-container');
          container.remove();
        }, 1000);
      }
    }
  }


  template(){    
    if (this.$state.type === 'WAIT') { // onclick  === O -> MACTH_TYPE === TOURNAMENT | ONE_ON_ONE , X -> SPINNER
      return `
      <div class='message-container position-absolute top-0 vw-100 vh-100 bg-secondary bg-gradient d-flex justify-content-center align-items-center'>
        ${this.$state.onClick ? 
          `<button class='wait-callback'>${this.$state.message}</button>`
          : "<div class='spinner-border text-primary'style='width: 3rem; height: 3rem;' role='status'></div>"
          }
      </div>
    `}
    if (this.$state.type === GAME_MODE.END_GAME){
      return `
        <div class='message-container position-absolute top-0 vw-100 vh-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50'>
          <div>
            <p class='text-white message'>${this.$state.data.message}</p>
          <div>
        </div>
      `
    }
    return '';
  }

  componentWillUnmount(){
    PongManager.stateClear();
  }
}