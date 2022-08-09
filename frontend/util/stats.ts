import { Range } from "./misc.js";

interface Task {
	contest_year: number,
	index: number,
	link: string | null, // null means the task is so old it's not saved
	max_score_possible: number,
	name: string,
	title: string
}

interface Contest {
	pageProps: {
		contest: {
			avg_score: number,
			max_score: number,
			max_score_possible: number,
			num_contestants: number,
			region: string,
			year: number,
			location: {
				gmaps: string | null,
				longitude: number | null,
				latitude: number | null,
				location: string
			},
			medals: {
				bronze: {
					count: number,
					cutoff: number
				},
				silver: {
					count: number,
					cutoff: number
				},
				gold: {
					count: number,
					cutoff: number
				}
			},
			navigation: {
				current: number,
				previous: number,
				next: number
			},
			tasks: Array<Task>
		}
	},
	__N_SSG: boolean
}

async function getAllTasks(from: number, to: number) {
	const id = "gphdM1jkKB5gEYSdkx8UD";
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`;
	const tasks: {[year: number]: Array<Task>} = {};

	for (let i = from; i <= to; i++) {
		try {
			const res = await fetch(url(i));
			const data: Contest = await res.json();
			tasks[i] = data.pageProps.contest.tasks;

			// task.name is inconsistent between stats.olinfo & training.olinfo
			// for ease of use i'm normalizing them all to the training.olinfo standard
			for (const t of tasks[i])
				if (t.link) t.name = t.link.split("/task/")[1].split("/statement")[0];

		} catch (err) {}
	}

	return tasks;
}

export {
	Task,
	getAllTasks
}