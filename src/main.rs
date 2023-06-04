mod oii;
mod ois;

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
	let dump = match ois::get_competition_overview().await {
		Ok(v) => v,
		Err(e) => panic!("{}", e)
	};

	for ed in dump.editions {
		println!("{}", ed.str_id);
	}
}

#[tokio::main]
async fn main() {
	print_ois_overview().await;
}
