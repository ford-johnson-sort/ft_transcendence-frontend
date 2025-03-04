export const LOGIN_COOKIE = 'merge-insertion-sort';

export const MATCH_TYPE = Object.freeze({
  LOCAL: 'local',
  ONE_ON_ONE: '1on1',
  REMOTE: 'remote',
  TOURNAMENT: 'tournament'
});

export const PLAYER_NAMES = 'playerNames';

export const MOVEMENT = Object.freeze({
	LEFT_START: "LEFT_START",
	RIGHT_START: "RIGHT_START",
	LEFT_END: "LEFT_END",
	RIGHT_END: "RIGHT_END",
	KEYUP: {
		37: "LEFT_END",
		39: "RIGHT_END"
	},
	KEYDOWN: {
		37: "LEFT_START",
		39: "RIGHT_START"
	}
});


export const GAME_MODE = Object.freeze({
	WAIT:'WAIT',
	READY: 'READY',
	MOVE_PADDLE: 'MOVE_PADDLE',
	MOVE_BALL: 'MOVE_BALL',
	END_GAME: 'END_GAME',
	END_ROUND: 'END_ROUND',
	META_EVENTS: ['READY', 'WAIT', 'END_GAME', 'END_ROUND']
})

