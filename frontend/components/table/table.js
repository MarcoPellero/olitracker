function balance() {
	/* edits the table to make all of the rows have the same number of columns
	 *
	 * FROM:
	 * +---+---+---+
	 * |   |   |   |
	 * +---+---+---+---+
	 * |   |   |   |   |
	 * +---+---+---+---+
	 *
	 * TO:
	 * +---+---+---+---+
	 * |   |   |   |///|
	 * +---+---+---+---+
	 * |   |   |   |   |
	 * +---+---+---+---+
	*/

	const table = document.querySelector("table")
	const rows = Array.from(table.children)
	let max_columns = 0

	rows.forEach(row => {
		if (row.children.length > max_columns)
			max_columns = row.children.length
	})

	rows.forEach(row => {
		for (let i = row.children.length; i < max_columns; i++)
			row.append(document.createElement("td"))
	})
}

function create_cell(task) {
	const cell = document.createElement("td")

	if (!task.link) {
		cell.classList.add("unavailable")
		cell.textContent = task.name
		return cell
	}

	const link = document.createElement("a")
	link.textContent = task.name
	cell.append(link)

	cell.classList.add("score-" +
		(task.score === 100 ? "success"	:
		task.score === 0 ? "fail"	:
		task.score > 0 && task.score < 100 ? "mixed" :
		"null")
	)

	if (task.score !== null) cell.style = `--percentage-done: ${task.score}%`

	return cell
}

function populate(events) {
	const table = document.querySelector("table")
	table.innerHTML = "" // reset the table

	events.forEach(ev => {
		const row = document.createElement("tr")

		const header = document.createElement("th")
		header.textContent = ev.year
		row.append(header)

		ev.tasks.forEach(task => row.append(
			create_cell(task)
		))

		table.append(row)
	})

	balance()
}