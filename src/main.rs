mod oii;
mod ois;

struct Task {
	name: String,
	link: String
}

struct TaskGroup {
	tasks: Vec<Task>,
	id: String // for OII this'd be just the year, "2022", but for OIS, it could be "2022/1", year/round
}

struct Competition {
	task_groups: Vec<TaskGroup>,
	name: String
}

fn oii_normalize(contests: Vec<oii::Contest>) -> Competition {
	let mut comp = Competition {
		name: "oii".to_string(),
		task_groups: Vec::new()
	};

	for contest in contests {
		let mut group = TaskGroup {
			id: contest.year.to_string(),
			tasks: Vec::new()
		};

		for task in contest.tasks {
			if task.link.is_none() {
				println!("warning: oii{} task '{}' does not have a link and has therefore been skipped", contest.year, task.name);
				continue;
			}

			group.tasks.push(Task {
				name: task.name,
				link: task.link.expect("The task to have a link")
			});
		}

		if group.tasks.is_empty() {
			println!("warning: oii{} has been completely skipped because none of its tasks have links", contest.year);
			continue;
		}

		comp.task_groups.push(group);
	}

	return comp;
}

async fn print_oii_overview() {
	let dump = match oii::get_contests().await {
		Ok(v) => v,
		Err(e) => panic!("{}", e)
	};

	for contest in dump {
		println!("OII{} had {} tasks and {} contestants; It was held in {}",
			contest.year,
			contest.tasks.len(),
			contest.contestants,
			contest.region.unwrap_or("N/A".to_string()));
		
		for task in contest.tasks {
			println!("\tTask {}: {}", task.index, task.name);
		}
	}
}

async fn print_ois_overview() {
	let dump = match ois::get_competition_info().await {
		Ok(v) => v,
		Err(e) => panic!("{}", e)
	};

	for ed in dump.editions {
		println!("{}", ed.id_str);
	}
}

#[tokio::main]
async fn main() {
	// let oii_comp = oii_normalize(oii::get_contests().await.unwrap());

	let ed = ois::get_edition(10).await.unwrap();
}
