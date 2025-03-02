import Component from "../../common/Component.js";

export default class MainPage extends Component {
  setup() {
    this.$state = {
      currentUser: { name: 'User', img: '/assets/default-profile.png', active: true },
      users: [], // 사용자 목록
      isLoading: true,
      error: null
    };
    
    // 사용자 데이터 로드
    this.loadUsers();
  }
  
  async loadUsers() {
    try {
      // 실제로는 API 호출
      // const response = await fetch('/api/users');
      // const users = await response.json();
      
      // 목업 데이터
      const mockUsers = [
        { name: 'Alice', img: '/assets/profile1.png', active: true },
        { name: 'Bob', img: '/assets/profile2.png', active: false },
        { name: 'Charlie', img: '/assets/profile3.png', active: true },
        { name: 'Dave', img: '/assets/profile4.png', active: true },
        { name: 'Eve', img: '/assets/profile5.png', active: false }
      ];
      
      // 딜레이 시뮬레이션
      setTimeout(() => {
        this.setState({ 
          users: mockUsers,
          isLoading: false 
        });
      }, 1000);
      
    } catch (error) {
      this.setState({ 
        error: error.message,
        isLoading: false 
      });
    }
  }
  
  template() {
    const { currentUser, isLoading, error } = this.$state;
    
    return `
      <div id='main--idv'>
        <div id="topNavBar">
          <div id="currentUserInfo">
            <div class="position-relative">
              <span class="status-indicator ${currentUser.active ? "online" : "offline"}"></span>
              <img src="${currentUser.img}" alt="User Profile" class="profile-img">
            </div>
            <div class="currentUserName">
              <p class="mb-0">${currentUser.name}</p>
            </div>
          </div>
        </div>
        <div id="SEX">
          <div id="matchButtonContainer">
            <button class="btn btn-success" id="matchButton">매칭</button>
          </div>
          <div id="userInfoList">
            ${isLoading 
              ? '<div class="loading">Loading users...</div>' 
              : error 
                ? `<div class="error">${error}</div>`
                : '<!-- 사용자 목록이 여기에 동적으로 삽입됩니다 -->'
            }
          </div>
        </div>
      </div>
    `;
  }
  
  setEvent() {
    // 매칭 버튼 이벤트 처리
    const matchButton = this.$target.querySelector('#matchButton');
    if (matchButton) {
      matchButton.addEventListener('click', this.handleMatch.bind(this));
    }
    
    // 사용자 목록 클릭 이벤트 (이벤트 위임)
    const userList = this.$target.querySelector('#userInfoList');
    if (userList) {
      userList.addEventListener('click', this.handleUserAction.bind(this));
    }
  }
  
  handleMatch() {
    // 매칭 버튼 클릭 시 처리
    // 실제로는 서버에 매칭 요청을 보내고 게임 페이지로 이동
    console.log('Match requested');
    alert('매칭을 시작합니다!');
    // 추후 구현: 매칭 요청 처리
  }
  
  handleUserAction(e) {
    // 채팅 아이콘 클릭
    if (e.target.classList.contains('send-chat')) {
      const userCard = e.target.closest('.user-card');
      const username = userCard?.dataset.user;
      if (username) {
        console.log(`Chat with ${username}`);
        // 추후 구현: 채팅 기능
      }
    }
    
    // 초대 아이콘 클릭
    if (e.target.id === 'send-invite') {
      const userCard = e.target.closest('.user-card');
      const username = userCard?.dataset.user;
      if (username) {
        console.log(`Invite ${username} to game`);
        // 추후 구현: 게임 초대 기능
      }
    }
  }
  
  // 상태가 업데이트된 후 호출되는 메서드
  renderUserList() {
    const { users } = this.$state;
    const userListContainer = this.$target.querySelector('#userInfoList');
    
    if (userListContainer && users.length > 0) {
      userListContainer.innerHTML = users.map(user => `
        <section class="card user-card" data-user="${user.name}">
          <div class="user-card-upper">
            <div class="position-relative">
              <span class="status-indicator ${user.active ? "online" : "offline"}"></span>
              <img src="${user.img}" alt="User Profile" class="profile-img">
            </div>
            <div class="user-info">
              <p class="mb-0">${user.name}</p>
            </div>
            <div class="user-actions">
              <i class="bi bi-chat-dots send-chat"></i>
              <i class="bi bi-send" id="send-invite"></i>
            </div>
          </div>
        </section>
      `).join('');
    }
  }
  
  // 컴포넌트 업데이트 후 추가 작업
  componentDidUpdate() {
    // 사용자 목록 렌더링
    this.renderUserList();
  }
}