let supported_competitions // {name: string, code: string, round: undefined | string | number}[]

const user_data = {
	name: "",
	password: "",
	selected_competition: {
		code: "",
		round: undefined
	}
}

// grab all the supported competitions from the API and display them
console.log("Fetching supported competitions")
const start = Date.now()
fetch(`/api/list`)
	.then(async res => {
		supported_competitions = await res.json()
		console.log(`[${Date.now() - start}ms] Supported competitions:`, supported_competitions)

		const dropdown_menu = $("#competitions")
		for (const comp of supported_competitions)
			dropdown_menu.append(`<option>${comp.name}</option>`)
		
		// removes the initial state from the menu
		dropdown_menu.prop("selectedIndex", -1)
	})
	.catch(() => {
		console.log(`[${Date.now() - start}] Failed to fetch list of supported competitions`)
		// popup some error message saying the API might be down and to retry later
	})

// takes in an Event[] (as defined in backend/misc.ts)
const display = (events) => {
	const table_elem = $("#tasks")
	table_elem.empty()

	for (const ev of events) {
		const row_elem = document.createElement("tr")

		// year, month, any ID of when the competition took place
		const timestamp_elem = document.createElement("th")
		timestamp_elem.textContent = ev.year
		row_elem.append(timestamp_elem)

		// each element of ev.tasks is a Task object (as defined in backend/misc.ts)
		for (const task of ev.tasks) {
			const task_elem = document.createElement("td")
			task_elem.textContent = task.name

			if (task.score == 100)
				task_elem.classList.add("success")
			else if (task.score == 0)
				task_elem.classList.add("fail")
			else if (task.score) { // ignore null (default score)
				task_elem.classList.add("mixed")
				// set --percentage-done CSS var to task.score
			}

			row_elem.append(task_elem)
		}

		table_elem.append(row_elem)
	}
}

const fetch_competition = async (req_data) => {
	if (!req_data.selected_competition)
		throw new Error("No competition specified; can't fetch")

	const cache_token = `code=${req_data.selected_competition.code}&round=${req_data.selected_competition.round}`
	
	if (this.cache === undefined)
		this.cache = {} // {competition code : events}
	else if (this.cache[cache_token] !== undefined) {
		console.log(`Cache hit: ${cache_token}`)
		return this.cache[cache_token]
	}

	let query = `/api/tasks?comp=${req_data.selected_competition.code}`
	if (req_data.selected_competition.round !== undefined)
		query += `&round=${req_data.selected_competition.round}`

	const start = Date.now()
	console.log(`Fetching events with query: ${query}`)
	const res = await fetch(query)

	if (!res.ok)
		throw new Error(`[${Date.now() - start}ms] Failed to fetch events ({${res.status}} : ${res.statusText})`)
	else {
		const events = await res.json()
		console.log(`[${Date.now() - start}ms] Events:`, events)

		this.cache[cache_token] = events
		return events
	}
}

const fetch_scores = async (req_data) => {
	if (!req_data.name)
		throw new Error("Can't fetch scores if no user is provided")
	
	if (this.cache === undefined)
		this.cache = {} // {name : scores}
	else if (this.cache[req_data.name] !== undefined)
		return this.cache[req_data.name]

	let query = `/api/scores?comp=${req_data.selected_competition.code}&user=${req_data.name}`
	if (req_data.password)
		query += `&password=${req_data.password}`
	if (req_data.selected_competition.round !== undefined)
		query += `&round=${req_data.selected_competition.round}`

	const start = Date.now()
	console.log(`Fetching scores with query: ${query}`)
	const res = await fetch(query)

	if (!res.ok)
		throw new Error(`[${Date.now() - start}ms] Failed to fetch scores ({${res.status}} : ${res.statusText})`)
	else {
		const scores = await res.json()
		console.log(`[${Date.now() - start}ms] scores:`, scores)

		this.cache[req_data.name] = scores
		return scores
	}
}

const associate_scores = (events, scores) => {
	const events_copy = events.map(ev => ({
		year: ev.year,
		tasks: ev.tasks.map(task => ({
			name: task.name,
			link: task.link,
			id: task.id,
			max_score_possible: task.max_score_possible,
			score: scores[task.name] === undefined ? null : scores[task.name]
		}))
	}))
	
	return events_copy
}

// there's only 1 form so this selector is fine
// fetches the task with the username, pulling the scores
$("form").on("submit", () => {
	user_data.name = $("#username").val()
	// user_data.password = $("#password").val()
	console.log("User form submitted; user data:", user_data)

	// if the username is loaded, but the competition isn't, don't make a request
	// maybe popup some message?
	if (user_data.selected_competition.code)
		fetch_competition(user_data)
			.then(events => 
				fetch_scores(user_data).then(scores => 
					display(associate_scores(events, scores))
				).catch(() => display(events))
			)

	return false // prevents the page from reloading
})

// fetches the selected competition and fills the table
$("#competitions").on("change", () => {
	const index = $("#competitions").prop("selectedIndex")
	user_data.selected_competition = supported_competitions[index]

	fetch_competition(user_data)
		.then(events => {
			if (user_data.name)
				fetch_scores(user_data).then(scores =>
					display(associate_scores(events, scores))
				)
			else
				display(events)
		})
})
