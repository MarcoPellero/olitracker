import * as oii from "./nationals.js";
import express from "express";

const competitions: {[key: string]: {"task": Function, "score": Function}} = {
	"nationals": {"task": oii.getTasks, "score": oii.getScores}
}
const port = process.env.PORT || 8080;
const app = express();

app.use(express.static("../frontend/"));

app.get("/api/task", async (req, res) => {
	const { competition } = req.query;
	if (typeof competition != "string") {
		res.statusMessage = "Bad request. Example: /api/task?competition=nationals";
		res.status(400).end();
		return;
	} else if (!(competition in competitions)) {
		res.statusMessage = `{${competition} is not a valid competition}`;
		res.status(400).end();
		return;
	}

	try {
		const puller = competitions[competition];
		const tasks = await puller.task();
		res.json(tasks).end();
	} catch (err) {
		res.statusMessage = "An internal error occurred while fetching the data, probably due to bad input";
		res.status(500).end();
	}
});

app.get("/api/score", async (req, res) => {
	const { competition, user } = req.query;

	if (typeof competition != "string" || typeof user != "string") {
		res.statusMessage = "Bad request. Example: /api/task?competition=nationals&user=your_name";
		res.status(400).end();
		return;
	} else if (!(competition in competitions)) {
		res.statusMessage = `{${competition} is not a valid competition}`;
		res.status(400).end();
		return;
	}

	try {
		const puller = competitions[competition];
		const scores = await puller.score(user);
		res.json(scores).end();
	} catch (err) {
		res.statusMessage = "An internal error occurred while fetching the data, probably due to bad input";
		res.status(500).end();
	}
});

app.get("/api/competitions", (req, res) => {
	// list all supported competitions (by name)
	res.json(Object.keys(competitions)).end();
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});