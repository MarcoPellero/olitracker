const competitions = [];
const siteURL = document.location.origin;
let comp = []; // misc.Event[] (see ../backend/misc.ts)

let user = "";
let comp_name;

async function select_user(username) {
	user = username;
	display();
}

async function select_competition(index) {
	comp_name = competitions[index].code;
	display();
}

async function startup() {
	// grab all supported competitions
	const res = await fetch(`${siteURL}/api/comps`);
	competitions.push(...await res.json());
	
	const compList = $("#competitions");
	for (const c of competitions)
		compList.append(`<option>${c.name}</option>`);
	compList.prop("selectedIndex", -1); // no initial state; messes up shit, especially if there's only 1 supported comp
}

async function display() {
	let url = `${siteURL}/api/tasks?comp=${comp_name}`;
	if (user) url += `&user=${user}`;

	const res = await fetch(url);
	comp = await res.json();
	console.log(comp);
	console.log(comp);

	const table = $("#tasks");
	table.empty();

	for (const event of comp) {
		const row = document.createElement("tr");
		
		const head = document.createElement("th");
		head.textContent = event.year;
		row.append(head);

		for (const t of event.tasks) {
			const cell = document.createElement("td");
			cell.id = t.name;
			cell.textContent = t.name;

			if (t.score == 100) cell.classList.add("success");
			else if (t.score == 0) cell.classList.add("fail");
			else if (t.score != null) cell.classList.add("mixed");

			row.append(cell);
		}
		
		table.append(row);
	}
}

startup();