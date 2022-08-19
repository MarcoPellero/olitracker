import express from "express";
import * as misc from "./misc.js";
import * as oii from "./nationals.js";

const handlers: {[key: string]: misc.CompHandler} = {
	"nationals": {
		name: "nationals",
		getTasks: oii.wrapper
	}
};

const port = process.env.PORT || 8080;
const app = express();

app.use(express.static("../frontend/"));

app.get("/api/tasks", (req, res) => {
	const comp = req.query.comp as string;

	const handler = handlers[comp];
	if (typeof handler == "undefined") {
		res.status(400).send("Invalid competition");
		return;
	}
	
	const user = req.query.user as string;
	const password = req.query.password as string;
	handler.getTasks({ user, password })
		.then(tasks => res.json(tasks) )
		.catch(err => res.status(500).send("Internal error probably caused by malformed request") );
});

app.get("/api/comps", (req, res) => {
	res.json(Object.keys(handlers));
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});