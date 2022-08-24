let supported_competitions // {name: string, code: string}[]
const api_url = document.location.origin

const user_data = {
	name: "",
	password: "",
	selected_competition: -1 // index for supported_competitions element
}

// grab all the supported competitions from the API and display them
fetch(`${api_url}/api/list`)
	.then(async res => {
		console.log("Fetching supported competitions")
		const start = Date.now()
		supported_competitions = await res.json()
		console.log(`[${Date.now() - start}ms] Supported competitions:`, supported_competitions)

		const dropdown_menu = $("#competitions")
		for (const comp of supported_competitions)
			dropdown_menu.append(`<option>${comp.name}</option>`)
		
		// removes the initial state from the menu
		dropdown_menu.prop("selectedIndex", -1)
	})
	.catch(() => {
		console.log("Failed to fetch list of supported competitions")
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

// even though user_data is global, i prefer passing it, so this function can be used from the console
const fetch_competition = async (req_data) => {
	let query = `${api_url}/api/tasks?comp=${req_data.selected_competition}`

	// append optional auth parameters
	if (req_data.name)
		query += `&user=${req_data.name}`

	if (req_data.password)
		query += `&password=${req_data.password}`

	const start = Date.now()
	console.log(`Fetching events with query: ${query}`)

	const res = await fetch(query)

	if (!res.ok)
		throw new Error(`[${Date.now() - start}ms] Failed to fetch events ({${res.status}} : ${res.statusText})`)
	else {
		const events = await res.json()
		console.log(`[${Date.now() - start}ms] Events:`, events)
		return events
	}
}

// there's only 1 form so this selector is fine
// fetches the task with the username, pulling the scores
$("form").on("submit", () => {
	user_data.name = $("#username").val()
	// user_data.password = $("#password").val()
	console.log("User form submitted; user data:", user_data)

	// if the username is loaded, but the competition isn't, don't make a request
	// maybe popup some message?
	if (user_data.selected_competition != -1)
		fetch_competition(user_data)
			.then(display)

	return false // prevents the page from reloading
})

// fetches the selected competition and fills the table
$("#competitions").on("change", () => {
	const index = $("#competitions").prop("selectedIndex")
	user_data.selected_competition = supported_competitions[index].code

	fetch_competition(user_data)
		.then(display)
})
