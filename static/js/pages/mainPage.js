import { LOGIN_COOKIE } from "../constants/constants.js";
import { getCookie  } from "../utils/auth.js";
import { UserApi } from '../utils/apis.js';

export const mainPage = {
	async render() {
		const container = document.createElement('div');
		container.setAttribute('id', 'main--div');

		const currentUser = {
			// name: JSON.parse(atob(getCookie(LOGIN_COOKIE))).username,
			name: 'janhan',
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
		<div id="buttonContainer"
			<div id="matchButtonContainer">
				<button class="btn btn-success" id="matchButton">매칭</button>
				<button class="btn btn-success" id="localMatchButton">LOCAL PLAY</button>
			</div>
			<div id="userInfoList">
			</div>
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
				const existingChat = document.querySelector("#onChat");
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
		container.querySelector("#matchButton").addEventListener("click", () => {
			alert("매칭을 시작합니다!");
			// TODO: 매칭 API 호출 추가하기
			window.navigateTo('/pong')
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
