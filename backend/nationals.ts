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

async function get_comps(): Promise<misc.Event[]> {
	const statsId = "XBep9IDCqBxdgN3tlbD4B"; // need to scrape it from stats's HTML in case it changes
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${statsId}/contest/${year}.json`;

	const years = misc.range(2000, new Date().getFullYear() + 1);
	const res_arr = await Promise.all(years.map(y => fetch(url(y)) ));
	const data_arr: StatsYear[] = await Promise.all(
		res_arr.filter(res => res.ok)
		.map(async res => (await res.json()).pageProps)
	);

	return data_arr.map(data => ({
		year: data.year,
		tasks: data.contest.tasks.map(normalize_task)
	}));
}

const cache = () => {
	let timer = 0; // epoch timestamp of last data fetch
	let data: misc.Event[];

	const pull = async () => {
		if (Date.now() - timer >= 24 * 60 * 60 * 1000) { // 1d in ms
			data = await get_comps();
			timer = Date.now();
		}
		
		return data;
	}

	return pull;
}

const cache_pull = cache();

async function get_scores(username: string, unscored: misc.Event[]) {
	// deep clone of the input events, so the input isn't mutated
	const scored: misc.Event[] = unscored.map(ev => {
		let copy = Object.assign({}, ev);
		copy.tasks = ev.tasks.map(t => Object.assign({}, t));
		return copy;
	});

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

	
	// create a map to match task names to their score, to match all OII tasks
	const scoresMap: { [key: string]: number } = {};
	for (const t of data.scores) {
		const chunks = t.name.split("_"); // separate names like "pre-egoi_carte" in ["pre-egoi", "carte"]
		scoresMap[chunks[chunks.length - 1]] = t.score;
	}

	scored.map(comp => comp.tasks.map(task => {
		task.score = scoresMap[task.name] || null;
	}))

	return scored;
}

export async function wrapper(data: misc.UserData) {
	const unscored = await cache_pull();
	if (data.user !== undefined)
		return await get_scores(data.user, unscored);
	return unscored;
}

const debug = async () => {
	let start, end;
	const username = "Francesco3779";

	start = performance.now();
	const unscored = await cache_pull();
	end = performance.now();
	console.log(`Time to fetch tasks : ${end - start}ms`);

	start = performance.now();
	const scored = await get_scores(username, unscored);
	end = performance.now();
	console.log(`Time to fetch scores for use {${username}}: ${end - start}ms`);
}

// debug();