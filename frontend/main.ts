import { Task, getAllTasks } from "./util/stats.js";
import { UserProfile, getProfile, profileScores } from "./util/training.js";

const startYear = 2000;
const endYear = new Date().getFullYear();
let tasks: {[year: number]: Array<Task>}; // { year : [task1, task2, task3...] }

function createTable() {
	const table = $("#taskGrid");
	table.empty(); // on being re-called it empties and redraws the table
	
	for (let i = startYear; i <= endYear; i++) {
		if (!tasks[i]) continue;

		const row = $($.parseHTML(`<tr id=row_${i}></tr>`));
		row.append(`<th>${i}</th>`);

		for (const t of tasks[i]) {
			const cell = $($.parseHTML(`<td id=task_${t.name}></td>`));
			if (t.link) {
				cell.append(`<a href=${t.link}>${t.name}</a>`);
				cell.addClass("available");
			} else {
				cell.append(t.name);
				cell.addClass("unavailable");
			}
			
			row.append(cell[0]);
		}

		table.append(row[0]);
	}
}

async function colorTable() {
	const username = $("#username").val() as string;
	const profile = await getProfile(username);
	const scores = profileScores(profile);
	
	for (const year in tasks)
		for (const t of tasks[year])
			if (typeof scores[t.name] != "undefined") {
				const elem = $(`#task_${t.name}`);

				if (scores[t.name] == 100)
					elem.addClass("fullScore");
				else if (scores[t.name] == 0)
					elem.addClass("fail");
			}
}

async function main() {
	tasks = await getAllTasks(startYear, endYear);
	createTable();

	$("#selectUser").on("submit", () => {
		colorTable();
		return false;
	})
}

main();