	mod oii;

#[tokio::main]
async fn main() {
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
