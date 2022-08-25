import express from "express"
import * as misc from "./misc.js"
import * as oii from "./nationals.js"
import * as ois from "./ois_team.js"

const handlers: {[key: string]: misc.CompHandler} = {
	"oii": oii.handler,
	"ois": ois.handler
}

const handlers_cache: misc.HandlerCache = {}
for (const key in handlers) {
	if (handlers[key].has_sub_competitions)
		for (const sub of handlers[key].get_sub_competitions())
			handlers_cache[misc.cache_token(sub.code, sub.round)] = {
				timer: 0,
				data: []
			}
	else
		handlers_cache[misc.cache_token(handlers[key].code, undefined)] = {
			timer: 0,
			data: []
		}
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
	} else if (handler.has_sub_competitions && data.round === undefined) {
		console.log(`[${req_id}] GET /api/tasks => 400 No round selected`)
		res.status(400).send("No round selected")
		return
	}

	const last_cache = handlers_cache[misc.cache_token(handler.code, data.round)]
	console.log(last_cache)
	if (Date.now() - last_cache.timer < handler.cache_max_age) {
		console.log(`[${req_id}] GET /api/tasks => 200 Cache HIT`)
		res.json(last_cache.data)
		return
	}
	
	handler.get_tasks(data)
		.then(events => {
			handlers_cache[misc.cache_token(data.comp, data.round)] = {
				timer: Date.now(),
				data: events
			}
			console.log(`[${req_id}] GET /api/tasks => 200 Cache MISS`)
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
		if (handlers[code].has_sub_competitions)
			competition_list.push(...handlers[code].get_sub_competitions())
		else
			competition_list.push({code, name: handlers[code].name, round: undefined})
	}
	
	console.log(`[${req_id}] GET /api/list => 200`)
	res.json(competition_list)
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
