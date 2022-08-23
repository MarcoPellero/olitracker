import express from "express"
import * as misc from "./misc.js"
import * as oii from "./nationals.js"
import * as ois from "./ois_team.js"

const handlers: {[key: string]: misc.CompHandler} = {
	"nationals": {
		name: "OII",
		getTasks: oii.wrapper
	},
	"ois_1": {
		name: "OIS Round 1",
		getTasks: (data) => ois.wrapper(data, 1)
	},
	"ois_2": {
		name: "OIS Round 2",
		getTasks: (data) => ois.wrapper(data, 2)
	},
	"ois_3": {
		name: "OIS Round 3",
		getTasks: (data) => ois.wrapper(data, 3)
	},
	"ois_4": {
		name: "OIS Round 4",
		getTasks: (data) => ois.wrapper(data, 4)
	},
	"ois_final": {
		name: "OIS Finals",
		getTasks: (data) => ois.wrapper(data, "final")
	}
}

const port = process.env.PORT || 8080
const app = express()

app.use(express.static("../frontend/"))

app.get("/api/tasks", (req, res) => {
	const comp = req.query.comp as string

	const handler = handlers[comp]
	if (typeof handler == "undefined") {
		res.status(400).send("Invalid competition")
		return
	}
	
	const user = req.query.user as string
	const password = req.query.password as string
	handler.getTasks({ user, password })
		.then(tasks => res.json(tasks) )
		.catch(err => {
			res.status(500).send("Internal error probably caused by malformed request")
			console.log(err)
		})
})

app.get("/api/comps", (req, res) => {
	const comps: {code: string, name: string}[] = []
	for (const key in handlers)
		comps.push({code: key, name: handlers[key].name})
	
	res.json(comps)
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})