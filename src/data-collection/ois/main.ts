import axios, { AxiosResponse } from "axios"
import mysql from "mysql2/promise"
import * as dotenv from "dotenv"

import * as ois_types from "./types"
import * as db_types from "./../../db_types"

dotenv.config({path: __dirname + "/../.env"})

// it's just easier to work with this data if i make a list of all the 'contests' (rounds),
// and then hydrate each round with the info it lost from being detached to the edition
interface EditionExtended extends ois_types.RoundSpecific {
	year: number,
	contest_title: string // THIS IS DIFFERENT FROM JUST TITLE!! 'round1' VS 'OIS2013ROUND1'
}

async function fetch_contests(): Promise<EditionExtended[]> {
	const generic_url = "https://squadre.olinfo.it/json/edition.json"
	const generic_data: ois_types.EditionGeneric = await axios.get(generic_url).then(res => res.data)

	const round_requests = generic_data.editions.map(
		x => axios.get(`https://squadre.olinfo.it/json/edition.${x.id}.json`)
	)
	const final_requests = generic_data.editions.map(
		x => axios.get(`https://squadre.olinfo.it/json/edition.${x.id}.round.final.json`)
	)

	const round_data = (await Promise.allSettled(round_requests))
		.filter(pr => pr.status === "fulfilled")
		.map(pr => (pr as PromiseFulfilledResult<AxiosResponse>).value.data as ois_types.EditionSpecific)
	const final_data = (await Promise.allSettled(final_requests))
		.filter(pr => pr.status === "fulfilled")
		.map(pr => (pr as PromiseFulfilledResult<AxiosResponse>).value.data)
	
	// just add each final round into its relative edition
	final_data.forEach((x, idx) => {
		const value_mapping = {
			id: '5',
			name: "round5",
			title: "Round 5",
			fullscore: x.fullscore,
			tasks: x.tasks,
			year: x.year // for some reason even if it's a number it still passes that .split()[0]
		}

		round_data[idx].contests.push(value_mapping)
	})
	
	// flatten out into the single rounds
	const contests = round_data
		.map(ed => ed.contests.map(x => {
			const copy = x as EditionExtended
			copy.year = Number(ed.year.split('/')[0])
			copy.contest_title = `OIS${copy.year}${x.name.toUpperCase()}`
			return copy
		}))
		.flat()
	
	return contests
}

async function main() {
	const database = await mysql.createConnection(process.env.DATABASE_URL as string)

	const [[competition_data]] = await database.query<db_types.Competitions[]>("SELECT * FROM Competitions WHERE title='ois' LIMIT 1")
	const [stored_contests] = await database.query<db_types.Contests[]>(`SELECT * FROM Contests WHERE competition_id='${competition_data.id}'`)

	// differently from OII, to be able to pick single rounds, i'll make a 2d matrix: [[all rounds from y2012], [all rounds from y2013], etc]
	const raw_rounds = await fetch_contests()
	const official_contests = Array.from({length: new Date().getFullYear() - competition_data.first_year}, (x, idx) => {
		const year = competition_data.first_year + idx
		return raw_rounds.filter(x => x.year === year)
	})

	// this process is mostly the same as it was for OII, i won't comment the same things
	const exists = Array.from({length: official_contests.length}, (x, idx) => official_contests[idx].map(() => false))

	for (const contest of stored_contests) {
		// the reason why all the rounds are -1'd is because they're 1based
		const newer = official_contests[contest.year - competition_data.first_year][contest.round - 1]
		
		if (contest.num_of_tasks !== newer.tasks.length)
			database.query(`UPDATE Contests SET num_of_tasks=${newer.tasks.length} WHERE id=${contest.id}`)
		
		if (contest.title !== newer.contest_title)
			database.query(`UPDATE Contests SET title='${newer.contest_title}' WHERE id=${contest.id}`)
		
		// i don't check if the links are up-to-date because i have nowhere to check them against, i can only generate them manually, so they won't change
		// they're always <ois_${task_name}>

		exists[contest.year - competition_data.first_year][contest.round - 1] = true
	}

	for (const contest of raw_rounds) {
		if (exists[contest.year - competition_data.first_year][Number(contest.id) - 1])
			continue
		
		// insert the general contest data
		await database.query(`
			INSERT INTO Contests(competition_id, title, num_of_tasks, year, round)
			VALUES(${competition_data.id}, '${contest.contest_title}', ${contest.tasks.length}, ${contest.year}, ${contest.id})
		`)
	
		// fetch that row's id to reference it in the task rows
		const contest_id = (await database.query("SELECT LAST_INSERT_ID()") as unknown as [[{"LAST_INSERT_ID()": number}]])[0][0]["LAST_INSERT_ID()"]

		// in this loop i don't await my queries because they're independent of each other and of anything else
		for (const task of contest.tasks)
			database.query(`
				INSERT INTO Tasks(contest_id, title, link)
				VALUES(${contest_id}, '${task.name}', 'https://training.olinfo.it/#/task/ois_${task.name}/statement')
			`)
	}

	await database.end()
}

main()
