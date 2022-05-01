var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		height: "390",
		width: "640",
		videoId: "4vQ8If7f374",
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

function onPlayerReady(event) {
	event.target.playVideo();
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

//!  End of boilerplate *******************************************

var play = document.getElementById("play"),
	pause = document.getElementById("pause"),
	bar = document.getElementById("bar");

var i = 0;
function move() {
	if (i == 0) {
		i = 1;
		var elem = document.getElementById("bar");
		var width = 1;
		var id = setInterval(frame, player.getDuration() * 10);
		var paused = false;

		function frame() {
			if (width >= 100) {
				clearInterval(id);
				i = 0;
			} else {
				if (!paused) {
					width++;
					elem.style.width = width + "%";
					// console.log(width);
				}
			}
		}

		play.onclick = e => {
			e.preventDefault();
			paused = false;
			player.playVideo();
			move();
		};

		pause.onclick = e => {
			e.preventDefault();
			paused = true;
			player.pauseVideo();
		};
	}
}

play.onclick = () => {
	if (
		player.getPlayerState() == -1 ||
		player.getPlayerState() == 0 ||
		player.getPlayerState() == 2
	) {
		console.log(player.getDuration());
		player.playVideo();
		move();
	}
};

pause.onclick = () => {
	if (player.getPlayerState() == 1) {
		move();
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
	player.seekTo(vidTime);
	bar.style.width = Math.ceil(percentage * 100) + "%";
});
