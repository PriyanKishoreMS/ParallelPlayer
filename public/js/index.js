var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var socket = io();

var player;
var videoId = "4vQ8If7f374";
var videotime = 0;
var timeupdater = null;
function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		height: "390",
		width: "640",
		videoId: videoId,
		playerVars: {
			playsinline: 1,
			controls: 0,
			// disablekb: 1,
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

var play = document.getElementById("play"),
	pause = document.getElementById("pause"),
	bar = document.getElementById("bar"),
	progress = document.getElementById("progress"),
	url = document.getElementById("url"),
	urlbtn = document.getElementById("url-btn"),
	roominput = document.getElementById("room"),
	roombtn = document.getElementById("room-btn");

function onProgress(currentTime) {
	var percent = (currentTime / player.getDuration()) * 100;
	bar.style.width = percent + "%";
}

const playvid = vidurl => {
	if (player) {
		player.destroy();
	}
	player = new YT.Player("player", {
		height: "390",
		width: "640",
		videoId: vidurl,
		playerVars: {
			playsinline: 1,
			controls: 0,
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

roombtn.onclick = () => {
	room = roominput.value;
	socket.emit("join-room", room);
	alert(`You've joined the room ${room}`);
};

urlbtn.onclick = () => {
	var urlid = url.value.slice(-11);
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

$("#progress").on("click", function (e) {
	var offset = $(this).offset();
	var left = e.pageX - offset.left;
	var totalWidth = $("#progress").width();
	var percentage = left / totalWidth;
	var vidTime = player.getDuration() * percentage;
	console.log(Math.ceil(percentage * 100));
	console.log(vidTime);
	socket.emit("send-seek", vidTime, room);
});
