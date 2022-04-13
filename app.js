const express = require("express");
const ejs = require("ejs");

const app = express();

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

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on port 3000`);
});
