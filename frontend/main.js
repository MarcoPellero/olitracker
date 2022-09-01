api_wrapper = {
	timeout: 500,

	competition_list: () =>
		axios.get("/api/list", { timeout: api_wrapper.timeout })
			.then(res => res.data)
			.catch(() => {
				// popup some error box
				throw new Error("Fatal: couldn't fetch list of supported competitions")
			}),
	
	competition_events: async (comp_data) => {
		const cache_token = `${comp_data.code}--${comp_data.round}`
		if (this.cache === undefined)
			this.cache = {}
		else if (this.cache[cache_token] !== undefined) {
			console.info(`Cache HIT: ${cache_token}`)
			return this.cache[cache_token]
		}
		
		console.info(`Cache MISS: ${cache_token}`)
		
		return axios.get(`/api/tasks?comp=${comp_data.code}&round=${comp_data.round}`, { timeout: api_wrapper.timeout })
			.then(res => {
				this.cache[cache_token] = res.data
				return res.data
			})
			.catch(() => {
				// popup some warning box
				throw new Error(`Warning: couldn't fetch data for ${comp_data.name}`)
			})
	},
	
	user_scores: async (comp_data, user, password) => {
		const score_cache_lifetime = 60 * 1000 // 1 minute
		const cache_token = `${comp_data.code}--${user}--${password}`

		if (this.cache === undefined)
			this.cache = {}

		else if (this.cache[cache_token] !== undefined) {
			const age = Date.now() - this.cache[cache_token].time
			
			if (age >= score_cache_lifetime) {
				this.cache[cache_token] = undefined
				console.info(`Cache EXPIRE: ${cache_token}`)
			} else {
				console.info(`Cache HIT: ${cache_token}`)
				return this.cache[cache_token].data
			}
		} else
			console.info(`Cache MISS: ${cache_token}`)

		return axios.get(`/api/scores?comp=${comp_data.code}&user=${user}&password=${password}`)
			.then(res => {
				this.cache[cache_token] = {
					time: Date.now(),
					data: res.data
				}
				return this.cache[cache_token].data
			})
			.catch(() => {
				// popup some warning box
				throw new Error(`Warning: couldn't fetch scores for ${comp_data.name}, user: ${user}`)
			})
	}
}

async function spawn_competition(info, scores) {
	const events = structuredClone(await api_wrapper.competition_events(info))

	if (scores !== undefined)
		events.forEach(ev => ev.tasks.forEach(
			task => {
				if (scores[task.id] !== undefined)
					task.score = scores[task.id]
			}
		))
	
	// "Events for OII" or "Events for OIS Round 3"
	console.log(`Events for ${info.name}` +
		(info.round !== undefined ? ` round ${info.round}:` : ":"))
	
	// spawns a pretty table with columns "(index) | year | task N.0 | task N.1 | task N.3 ..."
	console.table(
		events.map(ev => {
			output = {year: ev.year}
			ev.tasks.forEach((task, idx) => {
				output[`name N.${idx}`] = task.name
				output[`score N.${idx}`] = task.score
			})

			return output
		})
	)

	populate(events) // defined in the table component (components/table/table.js)
}

async function startup() {
	console.warn("TODO: components/dropdown.css FIX: !important style on menu item:hover overwrites the <ul>'s rounded corners")
	console.info("Dev tip: if you open the page with the DevTools open, you'll be able to see tables displaying API data")

	const competition_list = await api_wrapper.competition_list()
	console.log("List of supported competitions:")
	console.table(competition_list)

	// selected competition object
	let selected = competition_list[0]
	// defaults to the first one, and now we spawn it, so the page isn't too empty on load
	try {
		spawn_competition(selected)
	} catch {
		console.warn("Error when spawning the default competition; the page is empty!")
		// we don't want the startup phase to die because of this error, it might not be fatal!
		// maybe popup some message?
	}

	// scores of the last user that was loaded; for when you jump between competitions
	let last_loaded_scores = undefined;

	// populates the dropdown menu with all of the known supported competitions
	const dropdown_menu = document.querySelector(".dropdown > .items")
	competition_list.forEach((val, idx) => {
		const menu_item = document.createElement("li")
		menu_item.textContent = val.name

		if (idx+1 == competition_list.length) // style reasons; check components/dropdown.css for details
			menu_item.classList.add("last-item")
		
		dropdown_menu.append(menu_item)
	})

	// create an event listener for all of the dropdown items to select & spawn competitions
	document.querySelectorAll(".dropdown > .items > *")
		.forEach((elem, idx) => elem.addEventListener("click", () => {
			selected = competition_list[idx]
			spawn_competition(selected, last_loaded_scores)
		}))
	
	// create an event listener for the user info form to select a user & spawn a competition with the user's scores
	document.querySelector(".user_box")
		.onsubmit = (event) => {
			try {
				const username = document.querySelector(".user_box > #username").value

				api_wrapper.user_scores(selected, username, "")
				.then(scores => {
						last_loaded_scores = scores
						spawn_competition(selected, scores)
					})
				.catch(() => {
					// if there's an error, or if the username is blank, remove all of the scores
					last_loaded_scores = undefined
					spawn_competition(selected)
				})
			} finally {
				event.preventDefault() // whether or not an error happens the page reload is always avoided
			}
		}
}

startup()