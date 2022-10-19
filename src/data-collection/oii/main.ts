import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
import mysql from "mysql2/promise"
import * as dotenv from "dotenv"

import * as oii_types from "./types"
import * as db_types from "./../../db_types"

dotenv.config({path: __dirname + "/../.env"})

async function fetch_stats_id(): Promise<string> {
	const url = "https://stats.olinfo.it"
	const html = await axios.get(url).then(res => res.data)

	const $ = cheerio.load(html)
	const nextjs_data = await JSON.parse(
		$("#__NEXT_DATA__").text()
	)

	return nextjs_data.buildId
}

async function fetch_contests(competition_data: db_types.Competitions | undefined): Promise<oii_types.StatsContest[]> {
	const stats_id = await fetch_stats_id()
	const contest_url = (year: number) => `https://stats.olinfo.it/_next/data/${stats_id}/contest/${year}.json`

	let first_year = competition_data?.first_year as number
	
	const current_year = new Date().getFullYear()
	const requests = Array.from(
		{length: current_year - first_year + 1},
		(x, idx) => {
			const year = first_year + idx
			const url = contest_url(year)
			return axios.get(url)
		}
	)

	const responses = (await Promise.allSettled(requests))
		.filter(pr => pr.status === "fulfilled")
		.map(pr => (pr as PromiseFulfilledResult<AxiosResponse>).value)
	
	const data: oii_types.StatsContest[] = responses
		.map(res => res.data)
	
	return data
}

async function main() {
	const database = await mysql.createConnection(process.env.DATABASE_URL as string)

	const [[competition_data]] = await database.query<db_types.Competitions[]>("SELECT * FROM Competitions WHERE title='oii' LIMIT 1")
	const [stored_contests] = await database.query<db_types.Contests[]>(`SELECT * FROM Contests WHERE competition_id='${competition_data.id}'`)

	const official_contests: oii_types.StatsContest[] = await fetch_contests(competition_data)

	// i tick off whether a contest is already in the database so as to only modify it, instead of inserting it again
	const exists = Array.from({length: official_contests.length}, () => false)

	// !IMPORTANT!
	// THESE CONTEST-UPDATE QUERIES CAN *EASILY* BE RAN ASYNCHRONOUSLY

	// for all of the existing contests, just see if the data is now deprecated and tick them as existing
	for (const contest of stored_contests) {
		const idx = contest.year - competition_data.first_year
		const newer = official_contests[idx]
		
		if (contest.num_of_tasks !== newer.pageProps.contest.tasks.length)
			database.query(`UPDATE Contests SET num_of_tasks=${newer.pageProps.contest.tasks.length} WHERE id=${contest.id}`)
		
		if (contest.title !== `OII${newer.pageProps.year}`)
			database.query(`UPDATE Contests SET title='OII${newer.pageProps.year}' WHERE id=${contest.id}`)
		

		const [old_tasks] = await database.query<db_types.Tasks[]>(`SELECT * FROM Tasks WHERE contest_id=${contest.id}`)
		// i HAVE to presume that the title has stayed the same, and that only the link could've changed,
		// because if not... i can't tell which task is which! i can't associate them with the newer ones

		for (const task of old_tasks) {
			const new_version = newer.pageProps.contest.tasks.find(x => x.name === task.title)

			if (task.link !== new_version?.link)
				database.query(`UPDATE Tasks SET link='${new_version?.link}' WHERE id=${task.id}`)
		}

		exists[idx] = true
	}

	// !IMPORTANT!
	// THERE IS A WAY TO RUN ALL OF THESE CONTEST-CREATION QUERIES ASYNCHRONOUSLY
	// THE ONLY THING WE WAIT FOR IS TO FETCH THE ID OF THE CONTEST ROW TO REFERENCE IT IN THE TASK
	// WE CAN JUST RUN THOSE SYNCHRONOUSLY AND SAVE THE IDS AND THEN LOAD ALL OF THE TASKS ASYNCHRONOUSLY, IT'S WAY FASTER!!!

	for (const contest of official_contests) {
		// if this contest is already in the database, don't insert it again!
		if (exists[contest.pageProps.year - competition_data.first_year])
			continue
		
		// insert the general contest data
		await database.query(`
			INSERT INTO Contests(competition_id, title, num_of_tasks, year, round)
			VALUES(${competition_data.id}, 'OII${contest.pageProps.year}', ${contest.pageProps.contest.tasks.length}, ${contest.pageProps.year}, 1)
		`)
	
		// fetch that row's id to reference it in the task rows
		const contest_id = (await database.query("SELECT LAST_INSERT_ID()") as unknown as [[{"LAST_INSERT_ID()": number}]])[0][0]["LAST_INSERT_ID()"]

		// in this loop i don't await my queries because they're independent of each other and of anything else
		for (const task of contest.pageProps.contest.tasks)
			database.query(`
				INSERT INTO Tasks(contest_id, title, link)
				VALUES(${contest_id}, '${task.name}', '${task.link}')
			`)
	}

	await database.end()
}

main()
