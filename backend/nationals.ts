import fetch from "cross-fetch";
import * as misc from "./misc.js";

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
});

async function get_tasks(): Promise<misc.Event[]> {
	const years = misc.range(2000, new Date().getFullYear() + 1);
	const statsId = "XBep9IDCqBxdgN3tlbD4B"; // need to scrape it from stats's HTML in case it changes
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${statsId}/contest/${year}.json`;

	const arr = await Promise.all( years.map(y => fetch(url(y))) )
	const output: misc.Event[] = [];
	for (const res of arr) {
		if (!res.ok) continue;

		const data: StatsYear = (await res.json()).pageProps;
		output.push({
			year: data.year,
			tasks: data.contest.tasks.map(normalize_task)
		});
		}

	return output;
}

async function add_scores(username: string, tasks: misc.Event[]) {
	const res = await fetch("https://training.olinfo.it/api/user", {
		method: "post",
		body: JSON.stringify({
			action: "get",
			username,
		}),
		headers: { "Content-Type": "application/json" }
	});

	const data: trainingUser = await res.json();
	if (!data.success)
		throw new Error("Invalid username");

	const scoresMap: { [key: string]: number } = {};
	for (const t of data.scores) {
		const chunks = t.name.split("_");
		scoresMap[chunks[chunks.length - 1]] = t.score;
	}

	for (const year of tasks)
		for (const t of year.tasks)
			if (scoresMap[t.name] != undefined)
				t.score = scoresMap[t.name];
}

export async function wrapper(data: misc.UserData) {
	const tasks = await get_tasks();
	if (data.user !== undefined)
		await add_scores(data.user, tasks);
	return tasks;
}

const debug = async () => {
	console.log(await wrapper({
		user: "marco_pellero",
		password: ""
	}));
}

// debug();