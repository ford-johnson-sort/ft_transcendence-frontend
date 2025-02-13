import { LOGIN_COOKIE } from "../constants/constants.js";
import { getCookie  } from "../utils/auth.js";
import { UserApi } from '../utils/apis.js';

export const mainPage = {
	async render() {
		const container = document.createElement('div', {id: "page--main"});


		const currentUser = {
			name: JSON.parse(atob(getCookie(LOGIN_COOKIE))).username,
			img: "https://placehold.co/60x60",
			active: true,
		};
		// API data-filed
		userList.render();
		container.innerHTML = `
		<div id="topNavBar">
		<div id="currentUserInfo">
		<div class="position-relative">
		<span class="status-indicator ${currentUser.active ? "online" : "offline" }"></span> <!-- 오프라인 상태 -->
		<img src="${currentUser.img}" alt="User Profile" class="profile-img">
		</div>
		<div class="currentUserName">
		<p class="mb-0">${currentUser.name}</p>
		</div>
		</div>
		</div>
			<div id="userInfoList">
		</div>
		`;

		container.querySelector("#userInfoList").addEventListener("click", (event) => {
			event.preventDefault();
			console.log("Send Chat")
			if (event.target.classList.contains("send-chat")) {
				console.log("if In")

				const userCard = event.target.closest(".user-card");
				console.log(userCard);
				const userName = event.target.dataset.username;

				// 기존 채팅 섹션이 있으면 삭제 (토글)
				const existingChat = document.querySelector("#onChat");
				// 채팅방이 열려있을때 열었던 id가 아니면 그 아이디 카드 밑에 생성하고시ㅠ으
				if (existingChat) {
					existingChat.remove();
				}
				console.log("After Return")
				const chatSection = document.createElement("div");
				chatSection.setAttribute('id', 'onChat')
				chatSection.className = "chat-section";
				chatSection.innerHTML = `
					<div class="chat-box">
						<p class="chat-header">Chat with ${userName}</p>
						<div class="chat-messages"></div>
						<input type="text" class="chat-input" placeholder="Type a message...">
					</div>
				`;

				userCard.appendChild(chatSection);
			}
		});
		return container;
	},
	css: 'styles/css/mainPage.css'
};


const userList = {
	async render(){
		const users = await UserApi.getUsers();
		const container = document.querySelector('#userInfoList');

		container.innerHTML = `${users.map(({name, img, active})=>{
			return `
			<section class="card user-card" data-user="${name}">
				<div class="user-card-upper">
					<div class="position-relative">
						<span class="status-indicator ${active ? "online" : "offline" }"></span> <!-- 오프라인 상태 -->
						<img src="${img}" alt="User Profile" class="profile-img">
					</div>
					<div class="user-info">
						<p class="mb-0">${name}</p>
					</div>
					<div class="user-actions">
						<i class="bi bi-chat-dots send-chat"></i>
						<i class="bi bi-send" id="send-invite"></i>
					</div>
				</div>
			</section>`;
		}).join('')}
		`
	}
}
