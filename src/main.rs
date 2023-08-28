use std::fs::File;
use std::io::{BufWriter, Write};
use futures::future::*;
use serde::Serialize;

mod oii;
mod ois;

#[derive(Debug, Serialize)]
struct Task {
	name: String,
	link: Option<String>
}

#[derive(Debug, Serialize)]
struct TaskGroup {
	tasks: Vec<Task>,
	id: String // for OII this'd be just the year, "2022", but for OIS, it could be "2022/1", year/round
}

#[derive(Debug, Serialize)]
struct Competition {
	task_groups: Vec<TaskGroup>,
	name: String
}

async fn get_oii_normalized() -> Result<Competition, String> {
	let contests = oii::get_contests().await?;

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
			group.tasks.push(Task {
				name: task.name.clone(),
				link: task.link.clone()
			});
		}

		comp.task_groups.push(group);
	}

	return Ok(comp);
}

async fn get_ois_normalized() -> Result<Vec<Competition>, String> {
	let info = ois::get_info().await?;

	let edition_responses = join_all(
		info.editions
		.iter()
		.map(|ed| ois::get_edition(ed.num_id))
	).await;

	let raw_editions: Vec<&ois::Edition> = edition_responses
		.iter()
		.map(|ed| ed.as_ref().unwrap())
		.collect();

	let mut comps = Vec::new();

	// i don't wanna hard-code the number of rounds :(
	// it starts out with no rounds, and for each competition, i'll add them as i go
	
	for ed in raw_editions {
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
						link: Some(format!("https://training.olinfo.it/#/task/ois_{}", t.name))
					})
					.collect()
			};

			comps[i].task_groups.push(group);
		}
	}

	return Ok(comps);
}

fn dump_competitions(competitions: &Vec<Competition>, path: &str) -> Option<String> {
	// if there was an error, it returns it. if not, it returns None

	let file = match File::create(path) {
		Ok(v) => v,
		Err(e) => return Some(e.to_string())
	};

	let mut writer = BufWriter::new(file);
	
	let serialization_err = serde_json::to_writer(&mut writer, &competitions).err();
	if serialization_err.is_some() {
		return Some(serialization_err.unwrap().to_string());
	}

	let write_err = writer.flush();
	if write_err.is_err() {
		return Some(write_err.err().unwrap().to_string());
	}

	None
}

#[tokio::main]
async fn main() {
	let mut competitions = Vec::new();
	competitions.push(get_oii_normalized().await.unwrap());
	competitions.extend(get_ois_normalized().await.unwrap());

	let dump_err = dump_competitions(&competitions, "data.json");
	if dump_err.is_some() {
		panic!("{}", dump_err.unwrap());
	}
}
