
/**
 * Base Component
 * @template P - The props type
 * @template S - The state type 
 */
export default class Comopnent {
  /** @type {Element} */
  $target;
  /** @type {P} */
  $props;
  /** @type {S} */
  $state;
  /** @type {Array<Object>} */
  children = [];

  /** @type {boolean} */
  $mounted = false;

  /** @type {Object.<string, Element>} */
  childrenContainers = {};
  
  /** @type {string} */
  $id;

  /**
   * @param {Element} $target - The DOM element to render the component into
   * @param {P} [props={}] - Component properties
   */
  constructor($target, $props = {}) {
    this.$target = $target;
    this.$props = $props;
    this.$id = `component_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 초기화
    this.setup();

    Renderer.register(this);
  }

  // TODO: constructor에서 초기셋팅을 하는게 좋을지 초기셋팅을 위한 메소드를 뚫어주는게 좋을지
  /**
   * Setup initial state
   * @virtual
   */
  setup() {}

  /**
   * Generate HTML template
   * @virtual
   * @returns string
   */
  template() {
    throw Error("template method must be overrride");
  }

  /**
   * Set event listeners
   * @returns {void}
   */
  setEvent(){};


  /**
   * 컴포넌트가 마운트되기 직전에 호출
   * @virtual
   */
  componentWillMount(){}


  /**
   * 컴포넌트 마운트 직후에 호출
   * @virtual 
   */
  componentDidMount(){}
  
  /**
   * 컴포넌트가 업데이트 되어야하는지 확인
   * @virtual
   * @param {P} nextProps 
   * @param {S} nextState
   * @return {boolean}
   */
   shouldComponentUpdate(nextProps, nextState){
    return true;
   }

  /**
   * 컴포넌트 업데이트 직전에 호출
   * @virtual
   */
  componentWillUpdate(){}


  /**
   * 컴포넌트 업데이트 직후에 호출
   * @virtual
   */
  componentDidUpdate(){}

 
  /**
   * 컴포넌트가 제거되기 전에 호출
   * @virtual
   */
  componentDidUnmount() {}
 
  /**
   * 상태 업데이트
   * @param {Partial<S>} newState
   */
  setState(newState) {
    const prevState = {...this.$state};
    const nextState = {...this.$state, ...newState};

    Renderer.updateState(this, nextState, prevState);
  }

  /**
   * 프롭스 업데이트
   * @param {Partial<P>} newProps
   */
  setProps(newProps) {
    const prevProps = {...this.$props};
    const nextProps = { ...this.$props, ...newProps};

    // 실제 업데이트 및 렌더링은 Renderer에 위임
    Renderer.updateProps(this, nextProps, prevProps);
  }

}