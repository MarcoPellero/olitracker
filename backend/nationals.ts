import axios from "axios"
import * as misc from "./misc.js"

interface StatsMedal {
	count: number,
	cutoff: number
}

interface StatsYearNavigation {
	current: number,
	next: null | number,
	previous: null | number
}

interface StatsStandaloneNavigation {
	current: {
		year: number,
		name: string,
	},
	next: null | {
		year: number,
		name: string
	},
	previous: null | {
		year: number,
		name: string
	}
}

interface StatsYearTask {
	contest_year: number,
	index: number,
	link: null | string,
	max_score_possible: number,
	name: string,
	title: string
}

interface StatsStandaloneScore {
	contestant: {
		first_name: string,
		last_name: string,
		id: string
	},
	internationals: {
		code: string,
		color: string,
		link: string,
		name: string
	}[],
	rank: number,
	score: number,
}

interface StatsYearScore extends StatsStandaloneScore {
	medal: null | string,
	past_partecipations: {
		year: number,
		medal: string
	}[],
	region: string | null,
	scores: number[]
}

interface StatsStandaloneTask extends StatsYearTask {
	navigation: StatsStandaloneNavigation,
	scores: StatsStandaloneScore[]
}

interface StatsYear {
	contest: {
		avg_score: number,
		location: {
			gmaps: null | string,
			latitude: null | number,
			location: null | string,
			longitude: null | number
		},
		max_score: number,
		max_score_possible: number,
		medals: {
			bronze: StatsMedal,
			gold: StatsMedal,
			silver: StatsMedal
		},
		navigation: StatsYearNavigation,
		num_contestants: number,
		region: null | string,
		tasks: StatsYearTask[],
		year: number
	},
	results: {
		navigation: StatsYearNavigation,
		results: StatsYearScore[],
		tasks: String[] // task names
	},
	year: number
}

interface trainingUser {
	access_level: number,
	first_name: string,
	global_access_level: number,
	institute: {},
	join_date: EpochTimeStamp,
	last_name: string,
	mail_hash: string,
	score: number,
	scores: {
		name: string,
		score: number,
		title: string
	}[],
	success: 0 | 1,
	tasks_solved: number,
	username: string
}

const normalize_task = (task: StatsYearTask): misc.Task => ({
	name: task.name,
	id: task.name,
	link: task.link,
	score: null,
	max_score_possible: task.max_score_possible,
})

async function get_comps(): Promise<misc.Event[]> {
	const statsId = "XBep9IDCqBxdgN3tlbD4B" // need to scrape it from stats's HTML in case it changes
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${statsId}/contest/${year}.json`

	const years = misc.range(new Date().getFullYear(), 2000, -1)
	const res_arr = await Promise.allSettled(
		years.map(y => axios.get(url(y)) )
	)

	const data_arr: StatsYear[] = []
	for (const res of res_arr) {
		if (res.status == "rejected")
			continue
		
		data_arr.push(res.value.data.pageProps)
	}

	return data_arr.map(data => ({
		year: data.year,
		tasks: data.contest.tasks.map(normalize_task)
	}))
}

async function get_scores(username: string) {
	const api_url = "https://training.olinfo.it/api/user"
	const payload = {
		action: "get",
		username
	}

	const res = await axios.post(api_url, payload)
	const profile: trainingUser = res.data

	if (!profile.success)
		throw new Error("Invalid user")
	
	const mapping: misc.ScoresMap = {}
	for (const task of profile.scores) {
		let chunks = task.name.split("_")
		mapping[chunks[chunks.length-1]] = task.score
	}
	return mapping
}

export const handler: misc.CompHandler = {
	code: "oii",
	name: "OII",
	get_tasks: (data: misc.ApiQuery) => get_comps(), // uncached
	get_scores: (data: misc.ApiQuery) => {
		if (data.user === undefined)
			throw new Error("No user provided")
		
		return get_scores(data.user)
	},
	get_sub_competitions: () => []
}

const debug = async () => {
	let start, end
	const username = "Francesco3779"

	start = performance.now()
	const unscored = await get_comps()
	end = performance.now()
	console.log(`Time to fetch tasks : ${end - start}ms`)

	/* start = performance.now()
	const scored = await get_scores(username, unscored)
	end = performance.now()
	console.log(`Time to fetch scores for user {${username}}: ${end - start}ms`) */
}

// debug()
