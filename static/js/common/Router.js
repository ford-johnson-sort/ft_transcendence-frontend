import Component from "./Component.js";
import Renderer from "./Renderer.js";

/**
 * @template T
 * @typedef {function(Object):Promise<T>} Loader
 *
 * @template T
 * @typedef {{
 *  path: string,
 *  component: typeof Component,
 *  loader?: Loader<T>}} Route
 */

/**
 * Router Class - History API 기반 구현
 * @extends Component
 */
export class Router extends Component {
  setup() {
    this.$state = {
      routes: [],
      currentPath: window.location.pathname || '/',
      activeComponent: null,
      isLoading: false,
      data: null,
      error: null
    };
    console.log('Router setup completed', this.$state);
  }

  componentDidMount() {
    try {
      // popstate 이벤트 리스너 설정 (브라우저 뒤로가기/앞으로가기)
      window.addEventListener('popstate', this.handlePopState.bind(this));

      // 링크 클릭 이벤트를 전역으로 처리
      document.addEventListener('click', this.handleLinkClick.bind(this));

      // 초기 라우트 처리 (routes가 설정된 후 호출되어야 함)
      if (this.$state.routes && this.$state.routes.length > 0) {
        this.handleRouteChange(window.location.pathname);
      }
    } catch (error) {
      console.error("Error in Router componentDidMount:", error);
    }
  }

  componentWillUnmount() {
    try {
      // 이벤트 리스너 정리
      window.removeEventListener('popstate', this.handlePopState.bind(this));
      document.removeEventListener('click', this.handleLinkClick.bind(this));
    } catch (error) {
      console.error("Error in Router componentWillUnmount:", error);
    }
  }

  /**
   * 라우트 추가
   * @template T
   * @param {string} path - 라우트 경로
   * @param {typeof Component} component - 경로에 렌더링할 컴포넌트
   * @param {{loader?: Loader<T>}} [options={}] - 추가 옵션
   */
  addRoute(path, component, options = {}) {
    try {
      if (!path || !component) {
        console.error("Invalid route configuration:", { path, component });
        return;
      }

      const newRoutes = [...(this.$state.routes || [])];
      newRoutes.push({
        path,
        component,
        loader: options.loader
      });

      this.setState({
        routes: newRoutes
      });

      // 현재 경로와 추가된 라우트가 일치하면 즉시 업데이트
      if (this.matchRoute(window.location.pathname, path)) {
        this.handleRouteChange(window.location.pathname);
      }
    } catch (error) {
      console.error("Error in addRoute:", error);
    }
  }

  /**
   * 링크 클릭 이벤트 핸들러
   * @param {MouseEvent} e - 클릭 이벤트
   */
  handleLinkClick(e) {
    try {
      // data-link 속성을 가진 링크만 처리
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('href');
        this.navigate(path);
      }
    } catch (error) {
      console.error("Error in handleLinkClick:", error);
    }
  }

  /**
   * popstate 이벤트 핸들러 (브라우저 뒤로가기/앞으로가기)
   */
  handlePopState() {
    try {
      this.handleRouteChange(window.location.pathname);
    } catch (error) {
      console.error("Error in handlePopState:", error);
    }
  }

  /**
   * 라우트 변경 핸들러
   * @param {string} path - 새 경로
   */
  async handleRouteChange(path) {
    try {
      // 이미 같은 경로라면 불필요한 업데이트 방지
      if (path === this.$state.currentPath && this.$state.activeComponent) return;

      // 로딩 상태 시작
      this.setState({
        currentPath: path,
        isLoading: true,
        data: null,
        error: null
      });

      // 데이터 로딩
      await this.loadRouteData(path);
    } catch (error) {
      console.error("Error in handleRouteChange:", error);
      this.setState({
        isLoading: false,
        error: error
      });
    }
  }

  /**
   * 새 경로로 이동
   * @param {string} path - 이동할 경로
   */
  navigate(path) {
    try {
      // 현재 페이지와 동일한 경로면 무시
      if (path === window.location.pathname) return;

      // 히스토리에 새 상태 추가
      window.history.pushState(null, '', path);

      // 라우트 변경 처리
      this.handleRouteChange(path);
    } catch (error) {
      console.error("Error in navigate:", error);
    }
  }

  /**
   * 현재 라우트에 대한 데이터 로딩
   * @param {string} path - 로드할 데이터의 경로
   */
  async loadRouteData(path) {
    try {
      const routes = this.$state.routes || [];
      const currentRoute = this.findMatchingRoute(path, routes);

      if (!currentRoute) {
        // 404 상태 설정
        this.setState({
          isLoading: false,
          data: null,
          error: new Error('Page not found')
        });
        return;
      }

      // 로더가 없으면 데이터 로딩 없이 완료
      if (!currentRoute.loader) {
        this.setState({
          isLoading: false,
          data: null,
          error: null
        });
        return;
      }

      try {
        // 경로 파라미터 추출 및 로더에 전달
        const params = this.extractParams(currentRoute.path, path);
        const data = await currentRoute.loader(params);

        // 상태 업데이트로 자동 리렌더링 유도
        this.setState({
          isLoading: false,
          data,
          error: null
        });
      } catch (error) {
        console.error('Error loading route data:', error);
        this.setState({
          isLoading: false,
          data: null,
          error
        });
      }
    } catch (error) {
      console.error("Error in loadRouteData:", error);
      this.setState({
        isLoading: false,
        data: null,
        error: error
      });
    }
  }

  /**
   * 경로 패턴과 현재 경로 매칭
   * @param {string} currentPath - 현재 경로
   * @param {string} routePath - 라우트 패턴
   * @returns {boolean} 매칭 여부
   */
  matchRoute(currentPath, routePath) {
    try {
      // 경로가 undefined인 경우 방어
      if (!currentPath || !routePath) return false;

      // 와일드카드 라우트 처리
      if (routePath === '*') {
        return true;
      }

      // 정확한 경로 일치
      if (routePath === currentPath) {
        return true;
      }

      // 동적 파라미터 경로 처리 (예: '/product/:id')
      if (routePath.includes(':')) {
        const routeParts = routePath.split('/').filter(Boolean);
        const pathParts = currentPath.split('/').filter(Boolean);

        if (routeParts.length !== pathParts.length) {
          return false;
        }

        return routeParts.every((part, i) => {
          if (part.startsWith(':')) {
            return true; // 파라미터 부분은 어떤 값이든 허용
          }
          return part === pathParts[i];
        });
      }

      return false;
    } catch (error) {
      console.error("Error in matchRoute:", error);
      return false;
    }
  }

  /**
   * 주어진 경로와 일치하는 라우트 찾기
   */
  findMatchingRoute(path, routes) {
    try {
      // routes 배열이 없거나 비어있을 경우 방어
      if (!routes || !Array.isArray(routes) || routes.length === 0) {
        return null;
      }

      // 정확히 일치하는 라우트 찾기
      let route = routes.find(r => r.path === path);

      // 동적 라우트 매칭
      if (!route) {
        route = routes.find(r => this.matchRoute(path, r.path));
      }

      // 와일드카드 라우트 찾기
      if (!route) {
        route = routes.find(r => r.path === '*');
      }

      return route;
    } catch (error) {
      console.error("Error in findMatchingRoute:", error);
      return null;
    }
  }

  /**
   * 현재 URL에서 경로 파라미터 추출
   * @param {string} routePath - 라우트 패턴 (예: '/product/:id')
   * @param {string} currentPath - 현재 경로 (예: '/product/123')
   * @returns {Object} 추출된 파라미터 (예: {id: '123'})
   */
  extractParams(routePath, currentPath) {
    try {
      const params = {};

      // 둘 중 하나라도 undefined면 빈 객체 반환
      if (!routePath || !currentPath) return params;

      if (!routePath.includes(':')) {
        return params;
      }

      const routeParts = routePath.split('/').filter(Boolean);
      const pathParts = currentPath.split('/').filter(Boolean);

      if (routeParts.length !== pathParts.length) {
        return params;
      }

      routeParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          const paramName = part.substring(1);
          params[paramName] = pathParts[i];
        }
      });

      return params;
    } catch (error) {
      console.error("Error in extractParams:", error);
      return {};
    }
  }

  /**
   * 컴포넌트 업데이트 시 현재 경로에 맞는 컴포넌트 렌더링
   */
  componentDidUpdate(prevProps, prevState) {
    try {
      // 안전하게 이전 상태 접근
      const safePrevState = prevState || {};
      const safeState = this.$state || {};

      // 상태 변경 여부 확인
      const pathChanged = safePrevState.currentPath !== safeState.currentPath;
      const routesChanged = safePrevState.routes !== safeState.routes;
      const loadingChanged = safePrevState.isLoading !== safeState.isLoading;
      const dataChanged = safePrevState.data !== safeState.data;
      const errorChanged = safePrevState.error !== safeState.error;

      // 무한 루프 방지를 위한 추가 검사
      const activeComponentChanged = safePrevState.activeComponent !== safeState.activeComponent;

      // 활성 컴포넌트 이미 존재하고, 상태 변경이 activeComponent만 해당되는 경우 스킵
      if (safeState.activeComponent && activeComponentChanged &&
          !pathChanged && !routesChanged && !loadingChanged && !dataChanged && !errorChanged) {
        console.log("Skipping redundant active component update");
        return;
      }

      // 관련 상태가 변경된 경우에만 컴포넌트 업데이트
      if (pathChanged || routesChanged || loadingChanged || dataChanged || errorChanged) {
        console.log("Router state changed, updating active component");
        this.updateActiveComponent();
      }
    } catch (error) {
      console.error("Error in componentDidUpdate:", error);
      // 중대한 오류인 경우만 컴포넌트 업데이트 시도
      if (!this.$state.activeComponent) {
        this.updateActiveComponent();
      }
    }
  }

  /**
   * 현재 경로에 맞는 컴포넌트 업데이트
   */
  updateActiveComponent() {
    try {
      // updateActiveComponent가 연속 실행되는 것을 방지
      if (this._updatingActiveComponent) {
        console.warn("Preventing recursive updateActiveComponent call");
        return;
      }

      this._updatingActiveComponent = true;

      // 안전하게 상태 접근
      const safeState = this.$state || {};
      const currentPath = safeState.currentPath || '/';
      const routes = safeState.routes || [];
      const isLoading = safeState.isLoading || false;
      const data = safeState.data;
      const error = safeState.error;

      console.log(`Updating active component for path: ${currentPath}`);

      // 기존 활성 컴포넌트가 있다면 언마운트
      if (safeState.activeComponent) {
        try {
          Renderer.unregister(safeState.activeComponent);
        } catch (e) {
          console.error("Error unregistering previous component:", e);
        }
      }

      const currentRoute = this.findMatchingRoute(currentPath, routes);

      if (currentRoute && currentRoute.component) {
        try {
          // 경로 파라미터 추출
          const params = this.extractParams(currentRoute.path, currentPath);

          // 기존 활성 컴포넌트와 동일한 컴포넌트 타입이면 별도 처리
          const componentClassName = currentRoute.component.name;
          console.log(`Creating new component: ${componentClassName}`);

          // 새 컴포넌트 마운트
          const component = new currentRoute.component(this.$target, {
            router: this,
            isLoading,
            data,
            error,
            params // 경로 파라미터 전달
          });

          // 직접 상태 수정하여 setState 호출을 줄임 (무한 루프 방지)
          this.$state = {
            ...this.$state,
            activeComponent: component
          };
        } catch (error) {
          console.error("Error creating active component:", error);
          // 오류 UI 표시
          this.$target.innerHTML = `<div class="error">컴포넌트 생성 중 오류 발생: ${error.message}</div>`;
        }
      } else {
        // 매칭되는 라우트가 없을 경우 404 처리
        this.$target.innerHTML = '<div class="not-found">페이지를 찾을 수 없습니다</div>';
      }

      this._updatingActiveComponent = false;
    } catch (error) {
      console.error("Error in updateActiveComponent:", error);
      // 심각한 오류 UI 표시
      this.$target.innerHTML = `<div class="critical-error">라우팅 중 오류 발생: ${error.message}</div>`;
      this._updatingActiveComponent = false;
    }
  }

  /**
   * 빈 템플릿 반환 - 실제 내용은 활성 컴포넌트가 렌더링
   */
  template() {
    return `
      <!-- Router Container -->
      <div class="router-view"></div>
    `;
  }

  /**
   * 다른 페이지로 이동하는 정적 메서드
   * @param {string} path - 이동할 경로
   */
  static push(path) {
    try {
      // 현재 활성화된 라우터 인스턴스 찾기
      const routerInstance = document.querySelector('[data-router]')?.__router;

      if (routerInstance) {
        routerInstance.navigate(path);
      } else {
        // 라우터 인스턴스를 찾을 수 없는 경우 직접 이동
        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (error) {
      console.error("Error in Router.push:", error);
      // 오류 발생 시 일반 페이지 이동
      window.location.href = path;
    }
  }
}
