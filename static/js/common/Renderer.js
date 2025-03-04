import Component from "./Component.js";

export default class Renderer {
  /** @type {Map<string, Component>} */
  static components = new Map();

  /** @type {Map<string, Map<string, Component>>} */
  static childInstances = new Map();

  /** @type {Set<Component>} */
  static updateQueue = new Set();

  /** @type {boolean} */
  static renderScheduled = false;

  /**
   * 컴포넌트 등록 및 초기 렌더링
   * @param {Component} component
   */
  static register(component) {
    Renderer.components.set(component.$id, component);
    Renderer.childInstances.set(component.$id, new Map());

    try {
      component.componentWillMount();
    } catch (error) {
      console.error("Error in componentWillMount:", error);
    }

    Renderer.renderComponent(component);
    // Renderer.setEvent();

    // try {
    //   component.setEvent();
    // } catch (error) {
    //   console.error("Error in setEvent:", error);
    // }

    component.$mounted = true;

    try {
      component.componentDidMount();
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }

  /**
   * unmount component
   * @param {Component} component
   */
  static unregister(component) {
    // 자식 컴포넌트들 먼저 언마운트
    const childMap = Renderer.childInstances.get(component.$id);

    if (childMap) {
      for (const childComponent of childMap.values()) {
        Renderer.unregister(childComponent);
      }
    }

    try {
      component.componentWillUnmount();
    } catch (error) {
      console.error("Error in componentWillUnmount:", error);
    }

    // 컴포넌트 참조 제거
    Renderer.components.delete(component.$id);
    Renderer.childInstances.delete(component.$id);
  }

  /**
   * 컴포넌트 렌더링
   * @param {Component} component
   */
  static renderComponent(component) {
    try {
      component.$target.innerHTML = component.template();

      component.childrenContainers = {};

      // $target 자체가 data-component 속성을 가진 경우 처리
      const containers = component.$target.querySelectorAll(':scope, [data-component]') || [];

      containers.forEach(container => {
        const id = container.dataset.component;
        if (id) {
          component.childrenContainers[id] = container;
        }
      });
      Renderer.renderChildren(component);
      component.setEvent();
    } catch (error) {
      console.error("Error in renderComponent:", error, component);
    }
  }

  /**
   * 자식 컴포넌트 렌더링
   * @param {Component} parentComponent
   */
  static renderChildren(parentComponent) {
    try {
      const childMap = Renderer.childInstances.get(parentComponent.$id);

      if (!childMap) return;

      // 현재 자식 컴포넌트 ID 목록
      const currentIds = new Set(
        (parentComponent.children || []).map(child => child.id).filter(Boolean)
      );

      // 제거된 자식 컴포넌트 언마운트
      for (const [id, childInstance] of childMap.entries()) {
        if (!currentIds.has(id)) {
          Renderer.unregister(childInstance);
          childMap.delete(id);
        }
      }

      // 자식 컴포넌트 렌더링
      for (const childDef of (parentComponent.children || [])) {
        const { id, type: ChildType, props = {} } = childDef;

        if (!id || !ChildType) continue;

        const container = parentComponent.childrenContainers[id];

        if (!container) continue;

        if (!childMap.has(id)) { // 초기 렌더링
          try {
            const childInstance = new ChildType(container, props);
            childMap.set(id, childInstance);
          } catch (error) {
            console.error(`Error creating child component ${id}:`, error);
          }
          continue;
        }

        // 리렌더링
        const childInstance = childMap.get(id);
        childInstance.$target = container;
        Renderer.updateProps(childInstance, props);

        // try {
        //   childInstance.setEvent();
        // } catch (error) {
        //   console.error(`Error in setEvent for child ${id}:`, error);
        // }
      }
    } catch (error) {
      console.error("Error in renderChildren:", error);
    }
  }

  /**
   * 상태 업데이트
   * @param {Component} component
   * @param {Object} nextState
   * @param {Object} prevState
   */
  static updateState(component, nextState, prevState) {
    try {
      // shouldComponentUpdate 호출 시 예외 처리
      let shouldUpdate = true;
      try {
        shouldUpdate = component.shouldComponentUpdate(component.$props || {}, nextState);
      } catch (error) {
        console.error("Error in shouldComponentUpdate:", error);
        // 오류 발생 시 기본적으로 업데이트 진행
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        component.$state = nextState;
        Renderer.enqueueUpdate(component, {
          type: 'state',
          prevProps: { ...(component.$props || {}) },
          prevState: { ...(prevState || {}) }
        });
      }
    } catch (error) {
      console.error("Error in updateState:", error);
    }
  }

  /**
   * 프롭스 업데이트
   * @param {Component} component
   * @param {Object} nextProps
   * @param {Object} [prevProps]
   */
  static updateProps(component, nextProps, prevProps) {
    try {
      // prevProps 기본값 설정
      const safeNextProps = nextProps || {};
      const safePrevProps = prevProps || component.$props || {};

      // shouldComponentUpdate 호출 시 예외 처리
      let shouldUpdate = true;
      try {
        shouldUpdate = component.shouldComponentUpdate(safeNextProps, component.$state || {});
      } catch (error) {
        console.error("Error in shouldComponentUpdate:", error);
        // 오류 발생 시 기본적으로 업데이트 진행
        shouldUpdate = true;
      }

      // props 업데이트
      component.$props = safeNextProps;

      if (shouldUpdate) {
        // 업데이트 큐에 추가
        Renderer.enqueueUpdate(component, {
          type: 'props',
          prevProps: safePrevProps,
          prevState: { ...(component.$state || {}) }
        });
      }
    } catch (error) {
      console.error("Error in updateProps:", error);
    }
  }

  /**
   * 업데이트 큐에 컴포넌트 추가
   * @param {Component} component
   * @param {Object} metadata
   */
  static enqueueUpdate(component, metadata) {
    try {
      // 컴포넌트 유효성 검사
      if (!component || !component.$id) {
        console.error("Invalid component in enqueueUpdate");
        return;
      }

      // 이미 많은 업데이트가 큐에 있는 특정 컴포넌트는 건너뛰기 (무한 루프 방지)
      const existingUpdates = [...Renderer.updateQueue].filter(c => c.$id === component.$id).length;
      if (existingUpdates >= 3) {
        console.warn(`Component ${component.constructor.name} (${component.$id}) has too many pending updates (${existingUpdates}). Skipping to prevent infinite loop.`);
        return;
      }

      // 메타데이터가 없는 경우 기본값 생성
      if (!metadata) {
        console.warn("Missing update metadata, creating default for component:", component.$id);
        metadata = {
          type: 'unknown',
          prevProps: { ...(component.$props || {}) },
          prevState: { ...(component.$state || {}) }
        };
      }

      // 메타데이터 안전하게 복사 (순환 참조 방지)
      component._updateMetadata = {
        type: metadata.type || 'unknown',
        prevProps: Renderer.safeCloneObject(metadata.prevProps || {}),
        prevState: Renderer.safeCloneObject(metadata.prevState || {})
      };

      // 컴포넌트 타입 로깅 (라우터 식별을 위해)
      const componentType = component.constructor.name;

      // 업데이트 대기열에 추가
      Renderer.updateQueue.add(component);

      // 배치 처리를 위한 타이머 설정
      if (!Renderer.renderScheduled) {
        setTimeout(() => {
          Renderer.renderScheduled = true;
          Renderer.processUpdateQueue();
        }, 0);
      }
    } catch (error) {
      console.error("Error in enqueueUpdate:", error);
    }
  }

  /**
   * 객체를 안전하게 복사하는 유틸리티 메서드 (순환 참조 방지)
   * @param {Object} obj - 복사할 객체
   * @returns {Object} 복사된 객체
   */
  static safeCloneObject(obj) {
    try {
      const result = {};

      // DOM 요소, 함수 등 위험한 속성 제외하고 복사
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          // DOM 요소, 함수, 순환 참조 가능성 있는 객체 복사 제외
          if (value instanceof HTMLElement || typeof value === 'function') {
            continue;
          }

          // 라우터 객체 제외 (순환 참조 방지)
          if (value && value.constructor && value.constructor.name === 'Router') {
            result[key] = { type: 'Router', id: value.$id };
            continue;
          }

          // 일반 객체는 재귀적으로 복사
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = Renderer.safeCloneObject(value);
          } else {
            // 원시 타입 및 배열은 그대로 복사
            result[key] = value;
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error in safeCloneObject:", error);
      return {}; // 오류 발생 시 빈 객체 반환
    }
  }

  /**
   * 업데이트 큐 처리
   */
  static processUpdateQueue() {
    try {
      // 업데이트 사이클 시작 시 플래그 표시
      const processingUpdateQueue = true;

      // 현재 큐에 있는 컴포넌트 복사
      const componentsToUpdate = [...Renderer.updateQueue];

      // 업데이트 큐 비우기
      Renderer.updateQueue.clear();

      // 무한 루프 방지를 위한 중복 컴포넌트 추적
      const processedComponents = new Set();

      // 현재 배치의 컴포넌트들 업데이트
      for (const component of componentsToUpdate) {
        try {
          // 이미 이 배치에서 처리한 컴포넌트는 스킵 (무한 루프 방지)
          if (processedComponents.has(component.$id)) {
            console.warn(`Skipping duplicate update for component: ${component.$id}`);
            continue;
          }

          processedComponents.add(component.$id);

          // 안전하게 메타데이터 접근
          const metadata = component._updateMetadata || {};
          const prevProps = metadata.prevProps || {};
          const prevState = metadata.prevState || {};

          // 디버깅을 위한 로그

          // Router 컴포넌트의 특별 처리 (무한 업데이트 방지)
          // FIXME
          // if (component.constructor.name === 'Router') {
          //   const lastRouterUpdateTime = component._lastUpdateTime || 0;
          //   const now = Date.now();

          //   // 너무 빈번한 라우터 업데이트 방지 (최소 100ms 간격)
          //   console.count('Router', component);
          //   if (now - lastRouterUpdateTime < 1) {
          //     console.warn('Router update throttled (too frequent updates)');
          //     continue;
          //   }

          //   component._lastUpdateTime = now;
          // }

          // componentWillUpdate 호출
          try {
            if (typeof component.componentWillUpdate === 'function') {
              component.componentWillUpdate(prevProps, prevState);
            }
          } catch (error) {
            console.error("Error in componentWillUpdate:", error);
          }

          // 컴포넌트 렌더링
          Renderer.renderComponent(component);

          // componentDidUpdate 호출 전 현재 상태 스냅샷 저장
          const stateBeforeDidUpdate = Renderer.safeCloneObject(component.$state || {});

          // componentDidUpdate 호출
          try {
            if (typeof component.componentDidUpdate === 'function') {
              component.componentDidUpdate(prevProps, prevState);
            }
          } catch (error) {
            console.error("Error in componentDidUpdate:", error);
          }

          // 무한 루프 감지: componentDidUpdate에서 상태 변경 확인
          // 이 검사는 복잡해서 일단 비활성화

          // 메타데이터 삭제
          delete component._updateMetadata;
        } catch (error) {
          console.error("Error processing component update:", error);
        }
      }

      // 다음 배치 처리 확인 (최대 재귀 방지를 위한 카운터 추가)
      const updateQueueSize = Renderer.updateQueue.size;

      setTimeout(() => {
        if (Renderer.updateQueue.size > 0) {
          // 새로운 업데이트가 있으면 다시 처리
          Renderer.processUpdateQueue();
        } else {
          // 업데이트 큐가 비어있으면 플래그 해제
          Renderer.renderScheduled = false;
        }
      }, 0);
    } catch (error) {
      console.error("Error in processUpdateQueue:", error);
      // 오류가 발생해도 렌더링 플래그 해제
      Renderer.renderScheduled = false;
    }
  }
}
