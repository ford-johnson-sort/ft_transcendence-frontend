import Component from "../common/Component.js";
import { Router } from "../common/Router.js";
import { GAME_MODE, MATCH_TYPE } from "../constants/constants.js";
import PongManager from "../pages/game/PongManager.js";
import Tournament from "../utils/tournament.js";
import { MATH_FUNNEL_COMPONENT } from "./MatchFunnel.js";

function getournamentText(round, winner){
  if (round !== 3){
    return `
      <p2>🏁 ROUND ${round} WINNER 🏁</p2>
      <p3>🔥${winner}🔥</p3>
    `
  }
  return `🔥MATCH WINNER🔥\n\n ${winner}`;
}



export default class PongManagerView extends Component {
  setup(){
    this.unsubscribe = PongManager.subscribe(({type, data = {}})=>{
      if (type === GAME_MODE.WAIT && data?.onClick){
        return this.setState({type, data:{ onClick: data?.onClick , message: data.message}});
      }

      if (type === GAME_MODE.WAIT && data?.start){
        return this.setState({type, data: {onClick: null, onStart: data.start, message: data.message}});
      }
      
      if (type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.TOURNAMENT){
        const { round } =  PongManager.getState({matchType: this.$props.matchType});
        return this.setState({type, data: {message: getournamentText(round, data.winner), round}});
      }
      if (type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.ONE_ON_ONE){
        return this.setState({type, data :{message: `WINNER ${data.winner}`}});
      }

      if (type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.REMOTE){
        return this.setState({type, data});
      }

    });

  }


  componentDidUpdate(){
    if(this.$state.type === GAME_MODE.WAIT && this.$state.data.onClick){
      const {onClick} = this.$state.data;
      this.$target.addEventListener('click', (e)=>{
        if(e.target.closest('.wait-callback')){
          const conatiner = document.querySelector('.message-container');
          conatiner.setAttribute('class', 'd-none');
          onClick();
        }
      });
    }

    if(this.$state.type === GAME_MODE.WAIT && this.$state.data.onStart){
      const {onStart} = this.$state.data;
      setTimeout(()=>{
        const container = document.querySelector('.message-container');
        container.remove();
        onStart();
      }, 2000);
    
    }


    if (this.$state.type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.TOURNAMENT) {
      const {round} = this.$state.data;
      setTimeout(()=>{
          if (round === 3) {
            Router.push('/main');
          }
        }, 2000);
    }

    if(this.$state.type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.ONE_ON_ONE){
      setTimeout(()=>{
        const container = document.querySelector('.message-container');
        container?.remove();
        Router.push('/main');
      }, 3000)
    }

    if (this.$state.type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.REMOTE){
      setTimeout(()=>{
        Router.push('/main');
      }, 3000);
    }
  }


  template(){    
    if (this.$state.type === 'WAIT' && this.$state.data.onClick) { // onclick  === O -> MACTH_TYPE === TOURNAMENT | ONE_ON_ONE , X -> SPINNER
      return `
      <div class='message-container position-absolute top-0 vw-100 vh-100 bg-primary bg-transparent d-flex justify-content-center align-items-center text-white'>
        <button class='wait-callback btn btn-secondary btn-lg'>${this.$state.data.message}</button>
      </div>
    `}

    if(this.$state.type === 'WAIT' && this.$state.data.onStart) {
      return `
        <div class='message-container position-absolute top-0 vw-100 vh-100 bg-secondary bg-gradient d-flex flex-column justify-content-center align-items-center text-white'>
          <h2>${this.$state.data.message}</h2>
          <div class='spinner-border text-primary'style='width: 3rem; height: 3rem;' role='status'></div>
        </div>
      `
    }
    if (this.$state.type === GAME_MODE.END_GAME && this.$props.matchType === MATCH_TYPE.REMOTE){
      return `
        <div class='message-container position-absolute top-0 vw-100 vh-100 d-flex justify-content-center align-items-center bg-secondary bg-opacity-50'>
          <div>
            <h2>${this.$state.data.win ? 'WIN' : 'LOSE'}</h2>
            <p class='text-white message'>${this.$state.data?.reason ||''}</p>
          <div>  
        </div>
      `
    }

    if (this.$state.type === GAME_MODE.END_GAME){
      return `
        <div class='message-container position-absolute top-0 vw-100 vh-100 d-flex justify-content-center align-items-center bg-secondary bg-opacity-50'>
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
    this.unsubscribe();
  }
}