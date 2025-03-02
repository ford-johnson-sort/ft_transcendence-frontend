import { Router } from '../common/Router.js'
import LoginPage from './pages/LoginPage.js';
import NotFoundPage from './pages/NotFound.js';
import MainPage from './pages/MainPage.js';
import PongPage from './pages/PongPage.js';


// 인증 상태 확인 및 리디렉션 처리를 위한 미들웨어
class AuthService {
  static isAuthenticated() {
    // 실제로는 토큰 검증 또는 세션 확인
    return localStorage.getItem('auth_token') !== null;
  }

  static authenticateUser(token) {
    localStorage.setItem('auth_token', token);
  }

  static logoutUser() {
    localStorage.removeItem('auth_token');
  }

  // 보호된 라우트에 대한 미들웨어
  static authGuard(next) {
    if (AuthService.isAuthenticated()) {
      return next; // 인증된 경우 다음 처리로 진행
    } else {
      // 인증되지 않은 경우 로그인 페이지로 리디렉션
      window.location.href = '/';
      return null;
    }
  }
}

// 앱 초기화 함수
function initializeApp() {
  const appContainer = document.getElementById('root');
  if (!appContainer) {
    console.error('앱 컨테이너를 찾을 수 없습니다.');
    return;
  }

  // 라우터 인스턴스 생성
  const router = new Router(appContainer);

  // OAuth 콜백 처리
  const handleOAuthCallback = async (params) => {
    try {
      const { code } = params;
      if (code) {
        // 실제로는 서버에 인증 코드를 보내고 토큰을 받음
        // const response = await fetch('/api/auth/token', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ code })
        // });
        // const data = await response.json();

        // 예시: 인증 성공 시 토큰 저장 및 메인 페이지로 리디렉션
        // if (data.token) {
        //   AuthService.authenticateUser(data.token);
        //   return { redirect: '/main' };
        // }

        // 목업: 인증 코드가 있으면 성공으로 간주
        console.log('OAuth authentication successful with code:', code);
        AuthService.authenticateUser('mock_token_' + Date.now());
        return { redirect: '/main' };
      }

      return null;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { error: 'Authentication failed' };
    }
  };

  // 라우트 등록
  router.addRoute('/', LoginPage);

  // OAuth 콜백 라우트
  router.addRoute('/auth/callback', LoginPage, {
    loader: handleOAuthCallback
  });

  // 보호된 라우트 (인증 필요)
  router.addRoute('/main', MainPage, {
    loader: (params) => AuthService.authGuard(() => {
      // 메인 페이지에 필요한 데이터 로드 로직
      return {}; // 필요한 데이터 반환
    })
  });
  // router.addRoute('/main/local', Local); -> Game Local -> State?
  // TODO:
  // local Play -> 1 vs 1, 토너먼트
  router.addRoute('/game', PongPage);

  // 404 페이지 (와일드카드 라우트)
  router.addRoute('*', NotFoundPage);

  console.log('라우트 등록 완료');

  // 초기 라우트 처리
  router.handleRouteChange(window.location.pathname);

  // 앱에 필요한 전역 이벤트 리스너 설정
  setupGlobalEventListeners();
}

// 전역 이벤트 리스너 설정
function setupGlobalEventListeners() {
  // 예: 로그아웃 이벤트 처리
  document.addEventListener('app:logout', () => {
    AuthService.logoutUser();
    window.location.href = '/';
  });

  // 예: 게임 초대 이벤트 처리
  document.addEventListener('app:game-invite', (e) => {
    const { from, gameId } = e.detail;
    if (confirm(`${from} invited you to a game. Accept?`)) {
      window.location.href = `/game?id=${gameId}`;
    }
  });
}

// DOM이 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', initializeApp);
