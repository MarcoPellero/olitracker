# normalizer for Pier's competition dump

import os
import json

def main():
	raw = os.listdir("../raw/")

	try:
		os.mkdir("../competitions")
	except FileExistsError:
		pass

	for comp in raw:
		print(f"Parsing {comp}")

		with open(f"../raw/{comp}") as f:
			data = json.load(f)
		
		out = { "name": data["competition"], "editions": [] }
		for ed in data["details"]:
			year = int(ed["edition"])
			ed_out = { "year": year, "contests": [] }

			for round in ed["rounds"]:
				contest = { "tasks": [] }

				for task in round["tasks"]:
					task_out = {
						"name": task["name"],
						"link": f"https://training.olinfo.it/#/task/{task['name']}"
					}

					contest["tasks"].append(task_out)

				ed_out["contests"].append(contest)

			out["editions"].append(ed_out)
		
		with open(f"../competitions/{comp}", "w") as f:
			json.dump(out, f)
		
		print(f"\tDone parsing {comp}")

if __name__ == '__main__':
	main()
