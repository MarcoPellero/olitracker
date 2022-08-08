interface oiiTask {
	contest_year: number,
	index: number,
	link: string | null,
	max_score_possible: number,
	name: string,
	title: string,
}

const startYear = 2000;
const endYear = new Date().getFullYear();
const tasks: {[key: number] : Array<oiiTask>} = {};
const url = "http://localhost:8080";

async function getOiiTasks() {
	const id = "gphdM1jkKB5gEYSdkx8UD";
	const url = (year: number) => `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`;
	
	const range = Array.from({length: endYear-startYear+1}, (x, i) => i + startYear);
	for await (const year of range) {
		try {
			const res = await fetch(url(year));
			const data = await res.json();
			tasks[year] = data.pageProps.contest.tasks;
		} catch (err) { }
	}
}

function createTable() {
	const table = $("#tasks")[0] as HTMLTableElement;

	for (let year = startYear; year <= endYear; year++) {
		if (!tasks[year]) continue;
		
		const row = document.createElement("tr");
		table.appendChild(row);

		const headCell = document.createElement("th");
		headCell.textContent = year.toString();
		row.appendChild(headCell);

		for (const t of tasks[year]) {
			const cell = document.createElement("td");
			cell.textContent = t.name;
			cell.id = `task_${t.name}`;
			row.appendChild(cell);
		}
	}

	if (isLogged()) colorTable();
}

const isLogged = () => document.cookie.split(";").find(x => x.startsWith("token=")) !== undefined;

async function postMacro(path: string, payload: object) {
	const res = await fetch(
		`${url}${path}`,
		{
			method: "post",
			credentials: "include",
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json"
			}
		})

	const data = await res.json();
	if (typeof data == "string") return JSON.parse(data); // sometimes it returns a string.. like double encoding
	return data;
}

async function login() {
	const username = $("#username").val();
	const password = $("#password").val();
	const keep_signed = $("#keep_signed").is(":checked");

	const data = await postMacro("/api/user", {action: "login", username, password, keep_signed});
	if (data.success) {
		console.log("login successful");
		colorTable();
	}
	else
		console.log("login unsuccessful");
}

async function getTaskScore(name: string) {
	const data = await postMacro(
		"/api/task",
		{
			action: "list",
			search: name,
			first: 0,
			last: 15
		});
	
	for (const t of data.tasks)
		if (t.name == name)
			return t.score;

	return undefined;
}

async function colorTable() {
	const getId = (link: string) => link.split("/task/")[1].split("/statement")[0];

	const range = Array.from({length: endYear-startYear+1}, (x, i) => i + startYear);
	for (const year of range) {
		if (!tasks[year]) continue;

		for (const t of tasks[year]) {
			const elem = $(`#task_${t.name}`);
			if (!t.link) {
				elem.addClass("oldTask");
				continue;
			}
			const score = await getTaskScore(getId(t.link));
			if (score != undefined)
				elem.addClass(`${score == 100 ? "all" : score == 0 ? "no" : "some"}Points`);
		}
	}
}

async function main() {
	await getOiiTasks();
	createTable();
}

main();