interface OiiTask {
	contest_year: number,
	index: number,
	link: string | null,
	max_score_possible: number,
	name: string,
	title: string
}

const apiURL = "http://localhost:8080/api/";
const OiiTasks: Array<Array<OiiTask>> = [];

async function fetchMacro(path: string, payload: Object) {
	const res = await fetch(
		`${apiURL}${path}`,
		{
			method: "post",
			body: JSON.stringify(payload),
			credentials: "include",
			headers: {
				"Content-Type": "application/json"
			}
		});
	
	const data = await res.json();
	if (typeof data == "string") // sometimes it returns a string instead of an object; this API isn't great
		return JSON.parse(data);
	return data;
}

async function login() {
	const path = "user";

	const username =
		(document.getElementById("username") as HTMLInputElement).value;
	const password =
		(document.getElementById("password") as HTMLInputElement).value;
	const keep_signed =
		(document.getElementById("keep_signed") as HTMLInputElement).checked;
	
	const payload = {
		action: "login",
		username,
		password,
		keep_signed
	};

	const data = await fetchMacro(path, payload);

	// add some visible popups
	if (data.success == 1)
		console.log("Login successful");
	else
		console.log("Login unsuccessful");
}

async function isLogged() {
	const cookies = document.cookie.split(";");
	let exists: boolean = false;
	for (const x of cookies)
		exists = exists && x.startsWith("token=");
	
	return exists;
}

const getTaskId = (link: string) => { return link.split("/task/")[1].split("/statement")[0] }

async function getTaskScore(name: string) {
	if (!isLogged())
		throw new Error("Can't retrieve task score without being logged in");

	const path = "task";
	const payload = {
		action: "list",
		search: name,
		first: 0,
		last: 15
	};

	const data = await fetchMacro(path, payload);
	const tasks = data.tasks;
	for (const t of tasks)
		if (t.name == name)
			return t.score;
	
	return undefined;
}

async function getOiiTasks() {
	const id = "gphdM1jkKB5gEYSdkx8UD";
	const url = (year: number) => { return `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`; };

	const firstYear = 2001;
	const lastYear = new Date().getFullYear();
	// by just using the current year it errors out if nationals haven't been held yet, but this way it's always up to date

	for (let year = firstYear; year <= lastYear; year++) {
		try {
			const res = await fetch(url(year));
			const data = await res.json();
			const tasks: Array<OiiTask> = data.pageProps.contest.tasks;
			OiiTasks.push(tasks);
		} catch (err) {
			console.log(err);
		}
	}
}

async function fillTable() {
	const table =
		(document.getElementById("tasks") as HTMLTableElement);
	
	for (let i = 0; i < OiiTasks.length; i++) {
		const row = document.createElement("tr");

		const thYear = document.createElement("th");
		thYear.textContent = OiiTasks[i][0].contest_year.toString();
		row.appendChild(thYear);

		for (const t of OiiTasks[i]) {
			const elem = document.createElement("td");
			elem.textContent = t.name;
			row.appendChild(elem);
		}

		table.appendChild(row);
	}
}

async function colorTable() {
	const rows = document.getElementsByTagName("tr");

	for await (const [i, tasks] of OiiTasks.entries()) {
		const cells = rows[i].getElementsByTagName("td");

		for await (const [j, t] of tasks.entries()) {
			const c = cells[j];
			if (typeof t.link !== "string") // typescript didn't recognize it as a type guard if i used tasks[j]
				continue;
			
			const score = await getTaskScore(getTaskId(t.link));

			if (score == undefined)
				continue
			c.classList.add(`${score == 0 ? "no" : score == 100 ? "all" : "some"}Points`)
		}
	}
}

async function main() {
	await getOiiTasks();
	await fillTable();
	colorTable();

	console.log(OiiTasks);
}

main();