use std::collections::HashMap;
use reqwest;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Navigation {
	#[serde(rename="current")]
	pub current_year: u32,
	#[serde(rename="previous")]
	pub previous_year: Option<u32>,
	#[serde(rename="next")]
	pub next_year: Option<u32>
}

#[derive(Deserialize)]
pub struct Location {
	#[serde(rename="location")]
	pub name: Option<String>,
	#[serde(rename="gmaps")]
	pub link: Option<String>,
	pub latitude: Option<f64>,
	pub longitude: Option<f64>
}

#[derive(Deserialize)]
pub struct Task {
	#[serde(rename="contest_year")]
	pub year: u32,
	pub name: String,
	pub title: String,
	pub link: Option<String>,
	pub index: usize,
	#[serde(rename="max_score_possible")]
	pub score_ceiling: Option<f32>
}

#[derive(Deserialize)]
pub struct Medal {
	pub count: Option<u32>,
	pub cutoff: Option<f32>
}

#[derive(Deserialize)]
pub struct Contest {
	pub year: u32,
	pub navigation: Navigation,
	pub location: Location,
	pub region: Option<String>,
	#[serde(rename="num_contestants")]
	pub contestants: u32,
	#[serde(rename="max_score_possible")]
	pub score_ceiling: Option<f32>,
	#[serde(rename="max_score")]
	pub high_score: Option<f32>,
	#[serde(rename="avg_score")]
	pub average_score: Option<f64>,
	pub tasks: Vec<Task>,
	pub medals: HashMap<String, Medal>
}

#[derive(Deserialize)]
struct DataDump {
	contests: Vec<Contest>
}

pub async fn get_contests() -> Result<Vec<Contest>, String> {
	// gets the data from github, and then parses it into structs

	let url = "https://raw.githubusercontent.com/algorithm-ninja/oii-stats/master/data/contests.json";
	
	let resp = match reqwest::get(url).await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let raw = match resp.text().await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let dump: DataDump = match serde_json::from_str(&raw) {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	return Ok(dump.contests);
}
