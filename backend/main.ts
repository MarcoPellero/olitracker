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
let unique_req_id = 0; // linearly incrementing ID for every request (for logging)

app.use(express.static("../frontend/"))

app.get("/api/tasks", (req, res) => {
	const req_id = unique_req_id++;

	const data: misc.ApiQuery = req.query as unknown as misc.ApiQuery
	console.log(`[${req_id}] GET /api/tasks query:`, data)

	const handler = handlers[data.comp]
	if (handler === undefined) {
		console.log(`[${req_id}] GET /api/tasks => 400 Invalid competition`)
		res.status(400).send("Invalid competition")
		return
	}
	
	handler.get_tasks(data)
		.then(events => {
			console.log(`[${req_id}] GET /api/tasks => 200`)
			res.json(events)
		})
		.catch(err => {
			console.log(`[${req_id}] GET /api/tasks => 500 Internal error`)
			res.status(500).send("Internal error probably caused by malformed request")
			console.log(err)
		})
})

app.get("/api/scores", (req, res) => {
	const req_id = unique_req_id++;

	const data: misc.ApiQuery = req.query as unknown as misc.ApiQuery
	console.log(`[${req_id}] /api/scores query:`, data)

	const handler = handlers[data.comp]
	if (handler === undefined) {
		console.log(`[${req_id}] GET /api/scores => 400 Invalid competition`)
		res.status(400).send("Invalid competition")
		return
	}
	
	handler.get_scores(data)
		.then(scores => {
			console.log(`[${req_id}] GET /api/scores => 200`)
			res.json(scores)
		})
		.catch(err => {
			console.log(`[${req_id}] GET /api/scores => 500 Internal error`)
			res.status(500).send("Internal error probably caused by malformed request")
			console.log(err)
		})
})

app.get("/api/list", (req, res) => {
	const req_id = unique_req_id++;
	console.log(`[${req_id}] /api/list`)

	const competition_list: misc.CompetitionInfo[] = []
	for (const code in handlers) {
		const sub_competitions = handlers[code].get_sub_competitions()
		if (sub_competitions.length)
			competition_list.push(...sub_competitions)
		else
			competition_list.push({code, name: handlers[code].name, round: undefined})
	}
	
	console.log(`[${req_id}] GET /api/list => 200`)
	res.json(competition_list)
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
