function create_table(contests, tasks_matrix) {
	const table = document.createElement("table")

	for (let i = 0; i < contests.length; i++) {
		const contest = contests[i]
		const tasks = tasks_matrix[i]

		const row = document.createElement("tr")

		const header = document.createElement("th")
		header.textContent = contest.year
		row.append(header)

		for (const task of tasks) {
			const cell = document.createElement("td")

			if (task.link.startsWith("http")) {
				const link = document.createElement("a")
				link.textContent = task.title
				link.href = task.link
				cell.append(link)

				// attach an ID used to attach scores to tasks
				cell.id = task.link.split("/task/")[1].split("/")[0]
			} else {
				cell.textContent = task.title
				cell.classList.add("null-link")
			}
			
			row.append(cell)
		}

		table.append(row)
	}

	return table
}

function attach_scores(table, scores) {
	table.querySelectorAll("td").forEach(cell => {
		cell.classList.remove("score-0")
		cell.classList.remove("score-some")
		cell.classList.remove("score-100")

		const score = scores[cell.id]
		if (score !== undefined) {
			cell.style = `--score: ${score}%`
			cell.classList.add(
				score === 0 ? "score-0" :
				score === 100 ? "score-100" :
				"score-some"
			)
		}
	})
}

async function main() {
	const html_select = document.querySelector("#competitions")
	const html_tables = document.querySelector("#tables")
	const html_form = document.querySelector("#username_form")

	// pre load ALL data on startup
	// data retrieval is very fast so cold start isn't really a problem honestly
	const competitions = await axios.get("/api/competitions").then(res => res.data)

	const contests = await Promise.all(competitions.map(
		x => axios.get(`/api/contests/${x.id}`).then(res => res.data)
	)).then(data => data.flat())

	const tasks = await Promise.all(contests.map(
		x => axios.get(`/api/tasks/${x.id}`).then(res => res.data)
	)).then(data => data.flat())

	console.log(competitions)
	console.log(contests)
	console.log(tasks)

	// pre generate *the whole HTML tables* for ULTIMATE EFFICENCY!!!
	const task_tables = {} // {competition_id : HTMLtable[]}
	for (const x of competitions) {
		const round_tables = []
		for (let i = 1; i <= x.num_of_rounds; i++) {
			const relevant_contests = contests.filter(y => y.competition_id === x.id && y.round === i)
			const relevant_tasks = relevant_contests.map(y => tasks.filter(z => z.contest_id === y.id))

			const table = create_table(relevant_contests, relevant_tasks)
			round_tables.push(table)
		}
		task_tables[x.id] = round_tables
	}

	// populate the dropdown-menu to select what competition to view
	for (const x of competitions) {
		const html_option = document.createElement("option")
		html_option.textContent = x.title
		html_select.append(html_option)
	}

	html_select.addEventListener("change", async () => {
		const idx = html_select.selectedIndex
		const selected_competition = competitions[idx]
		const premade_tables = task_tables[selected_competition.id]

		let scores
		const username = html_form.querySelector("input").value
		if (username)
			scores = await axios.get(`/api/scores/${username}`).then(res => res.data)
		else
			scores = []

		html_tables.innerHTML = ""
		premade_tables.forEach(x => attach_scores(x, scores))
		premade_tables.forEach(x => html_tables.append(x))
	})

	html_form.addEventListener("submit", event => {
		event.preventDefault()
		html_select.dispatchEvent(new Event("change"))
	})

	// spawn a competition on page load
	html_select.dispatchEvent(new Event("change"))
}

main()
