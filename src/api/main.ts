import express from "express"
import mysql from "mysql2"
import * as dotenv from "dotenv"

import * as db_types from "./../db_types"
import * as scoring from "./scoring"

dotenv.config({path: __dirname + "/.env"})
const database = mysql.createConnection(process.env.DATABASE_URL as string)

const cache_lifetime = 15 * 60 * 1000 // 15 minutes in milliseconds
const cache: {competitions: db_types.Competitions[], contests: db_types.Contests[], tasks: db_types.Tasks[]} = {
	competitions: [],
	contests: [],
	tasks: []
}

const app = express()
app.use(express.static("../website/"))

app.get("/api/competitions", (req, res) => {
	// database.query<db_types.Competitions[]>(
	// 	"SELECT * FROM Competitions",
	// 	(err, rows) => res.json(rows))
	const rows = cache.competitions

	res.json(rows)
})

app.get("/api/contests/:competition_id", (req, res) => {
	const sanitized_id = Number(req.params.competition_id)
	if (sanitized_id === NaN) {
		res.status(400).end()
		return
	}

	// database.query<db_types.Contests[]>(
	// 	`SELECT * FROM Contests WHERE competition_id=${sanitized_id} ORDER BY year DESC`,
	// 	(err, rows) => res.json(rows))
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

	// database.query<db_types.Tasks[]>(
	// 	`SELECT * FROM Tasks WHERE contest_id=${sanitized_id}`,
	// 	(err, rows) => res.json(rows))
	const rows = cache.tasks
	const filtered = rows.filter(x => x.contest_id == sanitized_id)

	res.json(filtered)
})

app.get("/api/scores/:username", async (req, res) => {
	const profile = await scoring.fetch_profile(req.params.username)
	if (profile.success !== 1)
		res.status(400).end()
	else {
		const title_to_score: {[title: string]: number} = {}
		for (const x of profile.scores)
			title_to_score[x.name] = x.score
		res.json(title_to_score)
	}
})

function cache_maintainer() {
	console.log("Updating cache..")

	database.query<db_types.Competitions[]>(
		"SELECT * FROM Competitions",
		(err, rows) => cache.competitions = rows)
	
	database.query<db_types.Contests[]>(
		"SELECT * FROM Contests",
		(err, rows) => cache.contests = rows)
	
	database.query<db_types.Tasks[]>(
		"SELECT * FROM Tasks",
		(err, rows) => cache.tasks = rows)
	
	console.log("Cache updated")
	setTimeout(cache_maintainer, cache_lifetime);
}

cache_maintainer()
app.listen(process.env.PORT, () => console.log(`API Open on port ${process.env.PORT}`))
