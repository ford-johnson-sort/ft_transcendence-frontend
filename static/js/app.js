import { Router } from './common/Router.js'
// import LoginPage from './pages/LoginPage.js';
import NotFoundPage from './pages/NotFound.js';
import MainPage from './pages/MainPage.js';
import HomePage from './pages/HomePage.js'
import AuthCallback from './pages/AuthCallback.js'
import PongGamePage from './pages/PongGamePage.js';


function initializeApp() {
  const appContainer = document.getElementById('root');
  if (!appContainer) {
    console.error('앱 컨테이너를 찾을 수 없습니다.');
    return;
  }

  // 라우터 인스턴스 생성
  const router = new Router(appContainer);

  // OAuth 콜백 처리

  router.addRoute('/', HomePage);
  router.addRoute('/login/callback', AuthCallback);

  /// MFA -> mail인증 /login/callback

  // 보호된 라우트 (인증 필요)
  router.addRoute('/main', MainPage);
  // router.addRoute('/main/local', Local); -> Game Local -> State?
  // TODO:
  // local Play -> 1 vs 1, 토너먼트
  // local Play -> 1 vs 1, 토너먼트
  // router.addRoute('/pong/:matchType', PongPageRenew);
  // mathcType == local / remote / tournerment
  // router.addRoute('/pong/tournament', PongTournamentPage);
  router.addRoute('/pong/:matchType', PongGamePage);

  router.addRoute('*', NotFoundPage);

  // 초기 라우트 처리
  router.handleRouteChange(window.location.pathname);
}

// DOM이 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', initializeApp);
