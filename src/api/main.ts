import express from "express"
import mysql from "mysql2"
import * as dotenv from "dotenv"

import * as db_types from "./../db_types"
import * as scoring from "./scoring"

dotenv.config({path: __dirname + "/.env"})

const cache_lifetime = 15 * 60 * 1000 // 15 minutes in milliseconds
const cache: {competitions: db_types.Competitions[], contests: db_types.Contests[], tasks: db_types.Tasks[]} = {
	competitions: [],
	contests: [],
	tasks: []
}
const log_ids = {
	"site_load": 0,
	"user": 0
}

const app = express()

app.get("/", (req, res, next) => {
	console.log(`[${log_ids.site_load++}] site load`)
	next()
})

app.use(express.static("../website/"))

app.get("/api/competitions", (req, res) => {
	const rows = cache.competitions
	res.json(rows)
})

app.get("/api/contests/:competition_id", (req, res) => {
	const sanitized_id = Number(req.params.competition_id)
	if (sanitized_id === NaN) {
		res.status(400).end()
		return
	}
	const rows = cache.contests
	const filtered = rows.filter(x => x.competition_id == sanitized_id)
	const ordered = [...filtered].sort((a, b) => b.year - a.year) // [...copied the array to avoid mutating the original]

	res.json(ordered)
})

app.get("/api/tasks/:contest_id", (req, res) => {
	const sanitized_id = Number(req.params.contest_id)
	if (sanitized_id === NaN) {
		res.status(400).end()
		return
	}
	const rows = cache.tasks
	const filtered = rows.filter(x => x.contest_id == sanitized_id)

	res.json(filtered)
})

app.get("/api/scores/:username", async (req, res) => {
	const profile = await scoring.fetch_profile(req.params.username)
	if (profile.success !== 1) {
		res.status(400).end()
		console.log(`[${log_ids.user++}] request for user <${req.params.username}> FAIL`)
	} else {
		const title_to_score: {[title: string]: number} = {}
		for (const x of profile.scores)
			title_to_score[x.name] = x.score
		res.json(title_to_score)
		console.log(`[${log_ids.user++}] request for user <${req.params.username}> SUCCESS`)
	}
})

function cache_maintainer() {
	// sometimes the DB server destroys the connection (not our fault!),
	// but if we open a new one each time then it should be able to re-query in 15 minutes, instead of killing the server
	const database = mysql.createConnection(process.env.DATABASE_URL as string)
	console.log("Updating cache..")

	try {
		database.query<db_types.Competitions[]>(
			"SELECT * FROM Competitions",
			(err, rows) => {
				if (err) console.log(err)
				else cache.competitions = rows
			})
		
		database.query<db_types.Contests[]>(
			"SELECT * FROM Contests",
			(err, rows) => {
				if (err) console.log(err)
				else cache.contests = rows
			})
		
		database.query<db_types.Tasks[]>(
			"SELECT * FROM Tasks",
			(err, rows) => {
				if (err) console.log(err)
				else cache.tasks = rows
			})
	} catch (err) {
		console.log("An error occurred while trying to query the DB")
		console.error(err)
	}
	
	console.log("Cache updated")
	setTimeout(cache_maintainer, cache_lifetime);
}

cache_maintainer()
app.listen(process.env.PORT, () => console.log(`API Open on port ${process.env.PORT}`))
