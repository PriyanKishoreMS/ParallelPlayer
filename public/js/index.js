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

	/// Time tracking starting here********************************************

	// var lastTime = -1;
	// var interval = 600;

	// var checkPlayerTime = () => {
	// 	if (lastTime != -1) {
	// 		if (player.getPlayerState() == YT.PlayerState.PLAYING) {
	// 			var t = player.getCurrentTime();

	// 			//console.log(Math.abs(t - lastTime -1));

	// 			///expecting 1 second interval , with 500 ms margin
	// 			if (Math.abs(t - lastTime - 1) > 0.5) {
	// 				// there was a seek occuring
	// 				// console.log("seek"); /// fire your event here !
	// 			}
	// 		}
	// 	}
	// 	lastTime = player.getCurrentTime();
	// 	setTimeout(checkPlayerTime, interval); /// repeat function call in 1 second
	// };
	// setTimeout(checkPlayerTime, interval); /// initial call delayed
}

var done = false;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		// setTimeout(stopVideo, 6000);
		done = true;
	}
}

// const onPlayerStateChange = event => {
// var playing = false;
// if (event.data == YT.PlayerState.PLAYING) {
// 	playing = true;
// 	playVid();
// } else if (event.data == YT.PlayerState.PAUSED && !playing) {
// 	pauseVid();
// }
// };

// const playVid = () => {
// 	console.log("play");
// 	socket.emit(
// 		"send-data",
// 		{
// 			state: "play",
// 			time: player.getCurrentTime(),
// 		},
// 		room
// 	);
// };

// const pauseVid = () => {
// 	console.log("pause");
// 	socket.emit(
// 		"send-data",
// 		{
// 			state: "pause",
// 			time: player.getCurrentTime(),
// 		},
// 		room
// 	);
// };

// const onPlaybackRateChange = e => {
// 	changeRate();
// };

// const changeRate = () => {
// 	alert(player.getPlaybackRate());
// 	socket.emit("send-rate", player.getPlaybackRate(), room);
// };

window.onload = () => {
	alert(
		"Enter any room name and share the room name with your friends to start watching together!"
	);
	if (lastroom) alert(`You're now continuing in your previous room: ${room}`);
	if (videoId) {
		url.value = videoId;
	}
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
	// console.log(currentTime);
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

play.onclick = () => {
	console.log("play");
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
	console.log("pause");
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
	socket.emit("send-rate", rate.value, room);
};

$("#progress").on("click", function (e) {
	var offset = $(this).offset();
	var left = e.pageX - offset.left;
	var totalWidth = $("#progress").width();
	var percentage = left / totalWidth;
	var vidTime = player.getDuration() * percentage;
	socket.emit("send-seek", vidTime, room);
});
