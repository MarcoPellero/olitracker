import { Task, getAllTasks } from "./util/stats.js";
import { getProfile, profileScores } from "./util/training.js";

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
			const cell = $($.parseHTML(`<td id=task_${t.name}><div></div></td>`));
			if (t.link) {
				cell.addClass("available");
				cell.children().eq(0).append(`<a href=${t.link}>${t.name}</a>`);
			} else {
				cell.children().eq(0).append(t.name);
				cell.addClass("unavailable");
			}
			
			row.append(cell[0]);
		}

		table.append(row[0]);
	}
}

async function colorTable() {
	// reset classes; resets the cells when user changes
	$(".fullScore").removeClass("fullScore");
	$(".fail").removeClass("fail");
	$(".somePoints div").width("100%");
	$(".somePoints").removeClass("somePoints");
	// to prevent me from forgetting to add these i should add a second general class, grab that, and remove all of these

	const username = $("#username").val() as string;
	let scores;

	try {
		const profile = await getProfile(username);
		scores = profileScores(profile);
	} catch (err) {
		$("#error").show();
		setTimeout(() => {
			$("#error").fadeOut(2500);
		}, 1000);
		return;
	}
	
	for (const year in tasks)
		for (const t of tasks[year])
			if (typeof scores[t.name] != "undefined") {
				const elem = $(`#task_${t.name}`);

				if (scores[t.name] == 100)
					elem.addClass("fullScore");
				else if (scores[t.name] == 0)
					elem.addClass("fail");
				else {
  					elem.children("div").eq(0).css(`--percentage-done`, `${scores[t.name]}%`);
					elem.addClass("somePoints");
				}
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
