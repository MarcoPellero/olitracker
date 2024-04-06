const select	= document.querySelector("select");
const form		= document.querySelector("form");
const input		= form.querySelector("input");
const tables_div	= document.querySelector("div");

let competitions = [];
let scores = {};
let last_username = "";

async function loadScores() {
	const username = input.value;
	if (!username) {
		return;
	}

	if (username !== last_username) {
		last_username = username;
		scores = await fetch(`/api/scores?username=${username}`)
			.then(res => res.json());
	}
	
	console.log("Scores:", scores);

	const comp_prefix = competitions[select.selectedIndex].name.toLowerCase() + "_";

	// flush previous scores
	for (const elem of document.querySelectorAll("td")) {
		elem.classList.remove("score-0", "score-100", "score-some");
		elem.style = "";
	}

	for (const [task, score] of Object.entries(scores)) {
		const possible_names = [task, `${comp_prefix}_${task}`, task.split(comp_prefix)[1]];
		if (possible_names[2] === undefined) {
			possible_names.pop();
		}

		const elem = possible_names
			.map(name => document.getElementById(name))
			.find(elem => elem !== null);
		if (elem === undefined) {
			continue;
		}

		elem.classList.add(
			score === 0 ? "score-0" :
			score === 100 ? "score-100" :
			"score-some"
		);

		if (score !== 0 && score !== 100) {
			elem.style = `--score: ${score}%`;
		}
	}
}

function loadTable() {
	const idx = select.selectedIndex;
	const comp = competitions[idx];
	console.log(`Loading ${comp.name}`);

	const nRounds = comp.editions[0].contests.length;
	if (comp.editions.some(ed => ed.contests.length !== nRounds)) {
		const err_msg = "Different number of rounds in different editions";
		console.error(err_msg);
		alert(err_msg);
		return;
	}

	tables_div.innerHTML = "";
	for (let i = 0; i < nRounds; i++) {
		const table = document.createElement("table");
		tables_div.appendChild(table);

		for (const ed of comp.editions) {
			const row = table.insertRow();
			const title = document.createElement("th");
			title.textContent = ed.year;
			row.appendChild(title);

			const round = ed.contests[i];
			for (const task of round.tasks) {
				const cell = row.insertCell();
				cell.id = task.name;

				const a = document.createElement("a");
				a.textContent = task.name;
				a.href = task.link;
				a.target = "_blank";

				cell.appendChild(a);
			}
		}
	}

	loadScores();
}

async function main() {
	competitions = await fetch("/api/all").then(res => res.json());

	for (const comp of competitions)
		console.log(comp);

	for (const comp of competitions) {
		// sort by most recent
		comp.editions.sort((a, b) => b.year - a.year);

		const option = document.createElement("option");
		option.textContent = comp.name;
		select.appendChild(option);
	}

	select.addEventListener("change", loadTable);
	form.addEventListener("submit", event => {
		event.preventDefault();
		loadScores();
	})

	select.dispatchEvent(new Event("change")); // load first comp on page load
}

main();
