import Renderer from "./Renderer.js";

/**
 * Base Component
 * @template P - The props type
 * @template S - The state type
 */
export default class Component {
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
    if (!$target) {
      throw new Error('Component target element is required');
    }

    this.$target = $target;
    this.$props = $props || {};
    this.$state = {};
    this.$id = `component_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      // 초기화
      this.setup();
      Renderer.register(this);
    } catch (error) {
      console.error(`Error initializing component ${this.constructor.name}:`, error);
    }
  }

  /**
   * Setup initial state
   * @virtual
   */
  setup() {
    // 자식 클래스에서 구현
  }

  /**
   * Generate HTML template
   * @virtual
   * @returns {string}
   */
  template() {
    console.warn(`Component ${this.constructor.name} does not implement template method`);
    return '<div>No template implemented</div>';
  }

  /**
   * Set event listeners
   * @returns {void}
   */
  setEvent() {
    // 자식 클래스에서 구현
  }

  /**
   * 컴포넌트가 마운트되기 직전에 호출
   * @virtual
   */
  componentWillMount() {
    // 자식 클래스에서 구현
  }

  /**
   * 컴포넌트 마운트 직후에 호출
   * @virtual
   */
  componentDidMount() {
    // 자식 클래스에서 구현
  }

  /**
   * 컴포넌트가 업데이트 되어야하는지 확인
   * @virtual
   * @param {P} nextProps
   * @param {S} nextState
   * @return {boolean}
   */
  shouldComponentUpdate(nextProps = {}, nextState = {}) {
    // 기본적으로 항상 업데이트 허용
    return true;
  }

  /**
   * 컴포넌트 업데이트 직전에 호출
   * @param {P} prevProps - 이전 props
   * @param {S} prevState - 이전 state
   * @virtual
   */
  componentWillUpdate(prevProps, prevState) {
    // 자식 클래스에서 구현
  }

  /**
   * 컴포넌트 업데이트 직후에 호출
   * @param {P} prevProps - 이전 props
   * @param {S} prevState - 이전 state
   * @virtual
   */
  componentDidUpdate(prevProps, prevState) {
    // 자식 클래스에서 구현
  }

  /**
   * 컴포넌트가 제거되기 전에 호출
   * @virtual
   */
  componentWillUnmount() {
    // 자식 클래스에서 구현
  }

  /**
   * 상태 업데이트
   * @param {Partial<S>} newState - 업데이트할 새로운 상태
   */
  setState(newState) {
    if (!newState || typeof newState !== 'object') {
      console.warn('setState called with invalid newState', newState);
      return;
    }

    try {
      const prevState = {...this.$state};
      const nextState = {...this.$state, ...newState};

      // 상태 변화가 없으면 불필요한 업데이트 방지
      const hasChanged = Object.keys(newState).some(key => this.$state[key] !== newState[key]);
      // if (!hasChanged) {
      //   console.log(`Skipping setState - no change detected in ${this.constructor.name}`);
      //   return;
      // }

      Renderer.updateState(this, nextState, prevState);
    } catch (error) {
      console.error(`Error in setState for ${this.constructor.name}:`, error);
    }
  }

  /**
   * 프롭스 업데이트
   * @param {Partial<P>} newProps - 업데이트할 새로운 props
   */
  setProps(newProps) {
    if (!newProps || typeof newProps !== 'object') {
      console.warn('setProps called with invalid newProps', newProps);
      return;
    }

    try {
      const prevProps = {...this.$props};
      const nextProps = {...this.$props, ...newProps};

      // props 변화가 없으면 불필요한 업데이트 방지
      const hasChanged = Object.keys(newProps).some(key => this.$props[key] !== newProps[key]);
      if (!hasChanged) {
        return;
      }

      // 실제 업데이트 및 렌더링은 Renderer에 위임
      Renderer.updateProps(this, nextProps, prevProps);
    } catch (error) {
      console.error(`Error in setProps for ${this.constructor.name}:`, error);
    }
  }
}
