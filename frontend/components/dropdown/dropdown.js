document.querySelector(".dropdown > .title")
	.addEventListener("click", () => {
		let items = document.querySelector(".dropdown > .items")

		if (this.state === undefined)
			if (items.style.opacity === undefined)
				this.state = 0
			else if (items.style.opacity === 0)
				this.state = 1
			else
				this.state = 0
		
		items.style.opacity = this.state
		
		this.state = (this.state + 1) % 2
	})