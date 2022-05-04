const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.get("/", (req, res) => {
	res.render("index");
});

io.on("connection", socket => {
	console.log(`User ${socket.id} connected`);
	socket.on("disconnect", () => {
		console.log(`User ${socket.id} disconnected`);
	});
	socket.on("send-url", (id, room) => {
		if (room == "") {
			console.log(id);
			io.emit("recv-url", id);
		} else {
			io.to(room).emit("recv-url", id);
		}
	});
	socket.on("send-data", (data, room) => {
		if (room == "") {
			io.emit("recv-data", data);
		} else {
			io.to(room).emit("recv-data", data);
		}
	});
	socket.on("send-seek", (num, room) => {
		if (room == "") {
			io.emit("recv-seek", num);
		} else {
			io.to(room).emit("recv-seek", num);
		}
	});

	socket.on("join-room", room => {
		socket.join(room);
	});
});

server.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on port 3000`);
});
