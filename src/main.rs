use std::{cmp::min, cmp::max};
use futures::{future::*, join};

mod oii;
mod ois;

#[derive(Debug)]
struct Task {
	name: String,
	link: String
}

#[derive(Debug)]
struct TaskGroup {
	tasks: Vec<Task>,
	id: String // for OII this'd be just the year, "2022", but for OIS, it could be "2022/1", year/round
}

#[derive(Debug)]
struct Competition {
	task_groups: Vec<TaskGroup>,
	name: String
}

fn oii_normalize(contests: &Vec<oii::Contest>) -> Competition {
	let mut comp = Competition {
		name: "oii".to_string(),
		task_groups: Vec::new()
	};

	for contest in contests {
		let mut group = TaskGroup {
			id: contest.year.to_string(),
			tasks: Vec::new()
		};

		for task in contest.tasks.iter() {
			if task.link.is_none() {
				println!("warning: oii{} task '{}' does not have a link and has therefore been skipped", contest.year, task.name);
				continue;
			}

			group.tasks.push(Task {
				name: task.name.clone(),
				link: task.link.clone().expect("The task to have a link")
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

fn ois_normalize(editions: &Vec<&ois::Edition>) -> Vec<Competition> {
	let mut comps = Vec::new();
	// i don't wanna hard-code the number of rounds :(
	// it starts out with no rounds, and for each competition, i'll add them as i go
	
	for ed in editions {
		let year_str = ed.year_str.split('/').next().unwrap(); // 2022/23 -> 2022

		for (i, round) in ed.rounds.iter().enumerate() {
			if i >= comps.len() {
				comps.push(Competition {
					task_groups: Vec::new(),
					name: format!("ois{}", i+1)
				});
			}

			let group = TaskGroup {
				id: year_str.to_string(),
				tasks: round.tasks
					.iter()
					.map(|t| Task {
						name: t.name.clone(),
						link: format!("https://training.olinfo.it/#/task/ois_{}", t.name)
					})
					.collect()
			};

			comps[i].task_groups.push(group);
		}
	}

	return comps;
}

#[tokio::main]
async fn main() {
	let info = ois::get_info().await.unwrap();
	println!("{} Editions", info.editions.len());

	let ed_resps = join_all(
		info.editions
		.iter()
		.map(|ed| ois::get_edition(ed.num_id))
	).await;
	
	let eds: Vec<&ois::Edition> = ed_resps
		.iter()
		.map(|ed| ed.as_ref().unwrap())
		.collect();

	let comps = ois_normalize(&eds);

	let round = ois::get_round(12, "final").await.unwrap();
	println!("Round: {:?}", round);
}
