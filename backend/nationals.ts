import fetch from "cross-fetch";
import * as misc from "./misc";

interface statsMedal {
	count: number,
	cutoff: number
}

interface statsYearNavigation {
	current: number,
	next: null | number,
	previous: null | number
}

interface statsStandaloneNavigation {
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

interface statsYearTask {
	contest_year: number,
	index: number,
	link: null | string,
	max_score_possible: number,
	name: string,
	title: string
}

interface statsStandaloneScore {
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

interface statsYearScore extends statsStandaloneScore {
	medal: null | string,
	past_partecipations: {
		year: number,
		medal: string
	}[],
	region: string | null,
	scores: number[]
}

interface statsStandaloneTask extends statsYearTask {
	navigation: statsStandaloneNavigation,
	scores: statsStandaloneScore[]
}

interface statsYear {
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
			bronze: statsMedal,
			gold: statsMedal,
			silver: statsMedal
		},
		navigation: statsYearNavigation,
		num_contestants: number,
		region: null | string,
		tasks: statsYearTask[],
		year: number
	},
	results: {
		navigation: statsYearNavigation,
		results: statsYearScore[],
		tasks: String[] // task names
	},
	year: number
}

export async function getTasks(): Promise<misc.Task[][]> {
	const id = "gphdM1jkKB5gEYSdkx8UD"; // changes whenever the site is updated; can be scraped from the HTML; i should do that for sure...
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`;

	const output: misc.Task[][] = [];

	const years = misc.range(2000, new Date().getFullYear()+1);
	await Promise.all(
		years.map(async y => {
			const res = await fetch(url(y));
			if (res.status != 200)
				return [];

			const data: statsYear = (await res.json()).pageProps;
			
			const tasks: misc.Task[] = [];
			for (const t of data.contest.tasks)
				tasks.push(
				{
					name: t.name,
					title: t.title,
					link: t.link,
					score: null,
					max_score_possible: t.max_score_possible
				});
			
			return tasks;
		})
	).then(vals => {
		output.push(...( vals.filter(x => x.length > 0) ))
	});

	return output;
}

(async () => {
	console.log(misc.range(2000, new Date().getFullYear()+1));
	console.log(await getTasks());
})()