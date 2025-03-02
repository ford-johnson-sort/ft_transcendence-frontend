import {getCookie, COOKIE_NAME} from './auth.js'
import {runGame} from './game.js';

if (getCookie(COOKIE_NAME) != null) {
  createRoom();
}

function createRoom() {
  const roomFormDOM = document.getElementById('connect');
  roomFormDOM.style.visibility = 'visible';
  
  document.querySelector('#room-name-input').focus();
  document.querySelector('#room-name-input').onkeyup = function (e) {
    if (e.key === 'Enter') {
      document.querySelector('#room-name-submit').click();
    }
  };
  
  document.querySelector('#room-name-submit').onclick = function (e) {
    var roomName = document.querySelector('#room-name-input').value;
    resolveChannel(roomName);
  };
  
  function resolveChannel(roomName) {
    const userName = JSON.parse(atob(getCookie(COOKIE_NAME)))['username'];
    const formData = new FormData();
    formData.append("user1", userName);
    formData.append("user2", roomName);
    (async () => {
      try {
        const response = await fetch(`https://${window.location.host}/game/pong/new/`, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        });
  
        const ROOM_UUID = await response.json();
        console.log(ROOM_UUID);
        if (!ROOM_UUID['result']) {
          // TODO handle error
          console.error(ROOM_UUID);
        } else {
          roomFormDOM.style.visibility = 'hidden';
          runGame(ROOM_UUID);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    })();
  }
}

