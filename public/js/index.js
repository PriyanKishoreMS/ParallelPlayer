var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var socket = io();
var videoId = localStorage.getItem("local-url");
if (!videoId) videoId = "gDjMZvYWUdo";

var player;
var videotime = 0;
var height = "540";
var width = "1280";
var timeupdater = null;
function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		height: height,
		width: width,
		videoId: videoId,
		playerVars: {
			playsinline: 1,
			rel: 0,
			controls: 1,
			modestbranding: 0,
			// disablekb: 1,
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
			onRateChange: onPlaybackRateChange,
		},
	});
}

// function onPlayerReady(event) {
// 	event.target.playVideo();
// }

function onPlayerReady(e) {
	function updateTime() {
		var oldTime = videotime;
		if (player && player.getCurrentTime) {
			videotime = player.getCurrentTime();
		}
		if (videotime !== oldTime) {
			onProgress(videotime);
		}
	}
	timeupdater = setInterval(updateTime, 100);
	e.target.playVideo();
}

function onProgress(currentTime) {
	// console.log(currentTime);
}

var done = false;
const onPlayerStateChange = event => {
	// if (event.data == YT.PlayerState.PLAYING && !done) {
	// 	done = true;
	// }

	if (event.data == YT.PlayerState.PLAYING) {
		playVid();
	}
	if (event.data == YT.PlayerState.PAUSED) {
		pauseVid();
	}
};

const onPlaybackRateChange = e => {
	changeRate();
};

const changeRate = () => {
	alert(player.getPlaybackRate());
	socket.emit("send-rate", player.getPlaybackRate(), room);
};

const pauseVid = () => {
	console.log("pause");
	socket.emit(
		"send-data",
		{
			state: "pause",
			time: player.getCurrentTime(),
		},
		room
	);
};

const playVid = () => {
	console.log("play");
	socket.emit(
		"send-data",
		{
			state: "play",
			time: player.getCurrentTime(),
		},
		room
	);
};

window.onload = () => {
	alert(
		"Enter any room name and share the room name with your friends to start watching together!"
	);
	if (lastroom) alert(`You're now continuing in your previous room: ${room}`);
	if (videoId) {
		url.value = videoId;
	}
};

var url = document.getElementById("url"),
	urlbtn = document.getElementById("url-btn"),
	roominput = document.getElementById("room"),
	roombtn = document.getElementById("room-btn");

const playvid = vidurl => {
	if (player) {
		player.destroy();
	}
	player = new YT.Player("player", {
		height: height,
		width: width,
		videoId: vidurl,
		playerVars: {
			playsinline: 1,
			rel: 0,
			controls: 1,
			// disablekb: 1,
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
		},
	});
};

socket.on("recv-url", id => {
	playvid(id);
	localStorage.setItem("local-url", id);
});

socket.on("recv-data", data => {
	if (data.state == "play") {
		if (Math.abs(data.time - player.getCurrentTime()) > 1)
			player.seekTo(data.time);
		player.playVideo();
	} else if (data.state == "pause") {
		player.pauseVideo();
	}
});

socket.on("recv-rate", rate => {
	player.setPlaybackRate(parseInt(rate));
});

roombtn.onclick = () => {
	room = roominput.value;
	socket.emit("join-room", room);
	localStorage.setItem("last-room", room);
	alert(`You've joined the room ${room}`);
};

var lastroom = localStorage.getItem("last-room");
if (lastroom) {
	room = lastroom;
	socket.emit("join-room", room);
	roominput.value = room;
}

function makeroom(length) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

if (roominput.value == "" && !lastroom) {
	room = makeroom(5);
	socket.emit("join-room", room);
}

urlbtn.onclick = () => {
	var urlid = url.value.slice(-11);
	localStorage.setItem("local-url", urlid);
	socket.emit("send-url", urlid, room);
};
