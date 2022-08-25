import express from "express"
import * as misc from "./misc.js"
import * as oii from "./nationals.js"
import * as ois from "./ois_team.js"

const handlers: {[key: string]: misc.CompHandler} = {
	"nationals": oii.handler,
	"ois": ois.handler
}

const port = process.env.PORT || 8080
const app = express()

app.use(express.static("../frontend/"))

app.get("/api/tasks", (req, res) => {
	const data: misc.ApiQuery = req.query as unknown as misc.ApiQuery
	console.log("/api/tasks query:", data)

	const handler = handlers[data.comp]
	if (handler === undefined) {
		res.status(400).send("Invalid competition")
		return
	}
	
	handler.get_tasks(data)
		.then(events => res.json(events))
		.catch(err => {
			res.status(500).send("Internal error probably caused by malformed request")
			console.log(err)
		})
})

app.get("/api/scores", (req, res) => {
	const data: misc.ApiQuery = req.query as unknown as misc.ApiQuery

	const handler = handlers[data.comp]
	if (handler === undefined) {
		res.status(400).send("Invalid competition")
		return
	}
	
	handler.get_scores(data)
		.then(scores => res.json(scores))
		.catch(err => {
			res.status(500).send("Internal error probably caused by malformed request")
			console.log(err)
		})
})

app.get("/api/list", (req, res) => {
	const data: misc.ApiQuery = req.query as unknown as misc.ApiQuery

	const competition_list: misc.CompetitionInfo[] = []
	for (const code in handlers) {
		const sub_competitions = handlers[code].get_sub_competitions()
		if (sub_competitions.length)
			competition_list.push(...sub_competitions)
		else
			competition_list.push({code, name: handlers[code].name, round: undefined})
	}
	
	res.json(competition_list)
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
