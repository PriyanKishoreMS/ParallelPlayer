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
			controls: 0,
			modestbranding: 0,
			disablekb: 1,
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
		},
	});
}

// function onPlayerReady(event) {
// 	event.target.playVideo();
// }

// when the player is ready, start checking the current time every 100 ms.
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
	ttime.innerHTML = "/" + convertHMS(player.getDuration());
	if (videoId) {
		url.value = videoId;
	}
}

var done = false;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		// setTimeout(stopVideo, 6000);
		done = true;
	}
}

function stopVideo() {
	player.stopVideo();
}

window.onload = () => {
	alert(
		"Enter any room name and share the room name with your friends to start watching together!"
	);
	if (lastroom) alert(`You're now continuing in your previous room: ${room}`);
};

var play = document.getElementById("play"),
	pause = document.getElementById("pause"),
	bar = document.getElementById("bar"),
	progress = document.getElementById("progress"),
	url = document.getElementById("url"),
	urlbtn = document.getElementById("url-btn"),
	roominput = document.getElementById("room"),
	roombtn = document.getElementById("room-btn"),
	ctime = document.getElementById("current-time"),
	ttime = document.getElementById("total-time"),
	rate = document.getElementById("rate"),
	volume = document.getElementById("volume");

const convertHMS = value => {
	const sec = Math.floor(value);
	var hrs = Math.floor(sec / 3600);
	var mins = Math.floor((sec - hrs * 3600) / 60);
	var secs = sec - hrs * 3600 - mins * 60;
	if (hrs < 10) {
		hrs = "0" + hrs;
	}
	if (mins < 10) {
		mins = "0" + mins;
	}
	if (secs < 10) {
		secs = "0" + secs;
	}
	if (hrs > 0) return hrs + ":" + mins + ":" + secs;
	else return mins + ":" + secs;
};

function onProgress(currentTime) {
	var percent = (currentTime / player.getDuration()) * 100;
	bar.style.width = percent + "%";
	ctime.innerHTML = convertHMS(currentTime);
	player.setVolume(volume.value);
}

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
			controls: 0,
			disablekb: 1,
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

socket.on("recv-seek", num => {
	player.seekTo(num);
});

socket.on("recv-rate", rate => {
	if (rate == 1) {
		player.setPlaybackRate(0.25);
	} else if (rate == 2) {
		player.setPlaybackRate(0.5);
	} else if (rate == 3) {
		player.setPlaybackRate(1);
	} else if (rate == 4) {
		player.setPlaybackRate(1.5);
	} else if (rate == 5) {
		player.setPlaybackRate(2);
	}
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

play.onclick = () => {
	if (
		player.getPlayerState() == -1 ||
		player.getPlayerState() == 0 ||
		player.getPlayerState() == 2
	) {
		console.log(player.getDuration());
		socket.emit(
			"send-data",
			{
				state: "play",
				time: player.getCurrentTime(),
			},
			room
		);
	}
};

pause.onclick = () => {
	if (player.getPlayerState() == 1) {
		socket.emit(
			"send-data",
			{
				state: "pause",
				time: player.getCurrentTime(),
			},
			room
		);
	}
};

rate.onclick = () => {
	if (rate.value == 1) {
		socket.emit("send-rate", 1, room);
	} else if (rate.value == 2) {
		socket.emit("send-rate", 2, room);
	} else if (rate.value == 3) {
		socket.emit("send-rate", 3, room);
	} else if (rate.value == 4) {
		socket.emit("send-rate", 4, room);
	} else if (rate.value == 5) {
		socket.emit("send-rate", 5, room);
	}
};

$("#progress").on("click", function (e) {
	var offset = $(this).offset();
	var left = e.pageX - offset.left;
	var totalWidth = $("#progress").width();
	var percentage = left / totalWidth;
	var vidTime = player.getDuration() * percentage;
	socket.emit("send-seek", vidTime, room);
});
