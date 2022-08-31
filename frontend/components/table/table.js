function populate(events) {
	const table = document.querySelector("table")
	table.innerHTML = "" // reset the table

	events.forEach(ev => {
		const row = document.createElement("tr")

		const header = document.createElement("th")
		header.textContent = ev.year
		row.append(header)

		ev.tasks.forEach(task => {
			const cell = document.createElement("td")

			if (!task.link) {
				cell.classList.add("unavailable")
				cell.textContent = task.name
			} else {
				const link = document.createElement("a")
				link.href = task.link
				link.textContent = task.name
				cell.append(link)

				if (task.score === null)
					cell.classList.add("score-null")
				else if (task.score === 0)
					cell.classList.add("score-fail")
				else if (task.score === 100)
					cell.classList.add("score-success")
				else if (task.score > 0 && task.score < 100) { // ignore "edge cases" (type errors?)
					cell.classList.add("score-mixed")
					cell.style = `--percentage-done: ${task.score}%`
				}
			}

			row.append(cell)
		})

		table.append(row)
	})
}