const competitions = []; // string[]; ["terry", "nationals", "pre-egoi"]
const siteURL = document.location.origin;
const tasks = []; // misc.Task[][] (see ../backend/misc.ts)

async function select_user(username) {
}

async function select_competition(index) {
	const name = competitions[index];
}

async function startup() {
	// grab all supported competitions
	const res = await fetch(siteURL + "/api/competitions");
	competitions.push(...await res.json());
	
	const compList = $("#competitions");
	for (const c of competitions)
		compList.append(`<option>${c}</option>`);
	compList.prop("selectedIndex", -1); // no initial state; messes up shit, especially if there's only 1 supported comp
}

startup();