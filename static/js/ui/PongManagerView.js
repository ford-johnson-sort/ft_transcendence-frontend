import Component from "../common/Component.js";
import { GAME_MODE } from "../constants/constants.js";
import PongManager from "../pages/game/PongManager.js";


export default class PongManagerView extends Component {
  setup(){
    this.unsubscribe = PongManager.subscribe(({type, data = {}})=>{
      console.log(type, data);
      if (type === GAME_MODE.WAIT && data.onClick){
        this.setState({type, onClick: data.onClick, message: data.message});
      }
      console.log(type);
    })

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
  }


  template(){
    
    if(this.$state.type === 'WAIT'){ // onclick  === O -> MACTH_TYPE === TOURNAMENT | ONE_ON_ONE , X -> SPINNER
      return `
      <div class='message-container position-absolute top-0 vw-100 vh-100 bg-secondary bg-gradient d-flex justify-content-center align-items-center'>
        ${this.$state.onClick ? 
          `<button class='wait-callback'>${this.$state.message}</button>`
          : "<div class='spinner-border text-primary'style='width: 3rem; height: 3rem;' role='status'></div>"
          }
      </div>
    `}
    return ``;
    
    
    
  }
}