export const mainPage = {
	render() {
		const container = document.createElement('div', {id: "page--main"});

		const users = [{
			name: "chanii",
			img: "https://placehold.co/60x60",
			active: false,
		},{
			name: "janhan",
			img: "https://placehold.co/60x60",
			active: false,
		},{
			name: "kyugjile",
			img: "https://placehold.co/60x60",
			active: true,
		},{
			name: "minhulee",
			img: "https://placehold.co/60x60",
			active: true,
		}];

		const currentUser = {
			name: "janhan",
			img: "https://placehold.co/60x60",
			active: true,
		};

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
			${users.map(({name, img, active})=>{
				return `
				<div class="card user-card">
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
				</div>`;
			}).join('')}
			</div>
		`;

		container.querySelector("#userInfoList").addEventListener("click", (event) => {
			event.preventDefault();
			console.log("Send Chat")
			if (event.target.classList.contains("send-chat")) {
				console.log("if In")
				const userCard = event.target.closest(".user-card");
				const userName = event.target.dataset.username;

				// 기존 채팅 섹션이 있으면 삭제 (토글)
				const existingChat = document.querySelector("#onChat");
				if (existingChat) {
					existingChat.remove();
					return;
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
