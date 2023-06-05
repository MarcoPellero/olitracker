use reqwest;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Highlight {
	pub id: String,
	#[serde(rename="name")]
	pub team: String,
	pub description: String
}

#[derive(Deserialize)]
pub struct EditionInfo {
	#[serde(rename="name")]
	pub id_str: String,
	pub title: String,
	#[serde(rename="year")]
	pub year_str: String, // "2022/23", "2016/17"
	#[serde(rename="teams")]
	pub total_teams: u32,
	#[serde(rename="regions")]
	pub total_regions: u32,
	#[serde(rename="points")]
	pub total_points: u32,
	#[serde(rename="fullscore")]
	pub score_ceiling: u32,
	#[serde(rename="positive")]
	pub _positive: u32,
	#[serde(rename="highest")]
	pub high_score: u32,
	#[serde(rename="average")]
	pub average_score: f64,
	#[serde(rename="medpos")]
	pub _medpos: u32,
	#[serde(rename="tasks")]
	pub total_tasks: u32,
	#[serde(rename="instnum")]
	pub total_schools: u32,
	#[serde(rename="lastEd")]
	pub last_edition: u32, // this is the LAST edition, not the previous one
	#[serde(rename="id")]
	pub num_id: u32
}

#[derive(Deserialize)]
pub struct CompetitionInfo {
	pub highlights: Vec<Highlight>,
	#[serde(rename="allreg")]
	pub _all_reg: u32,
	#[serde(rename="avgreg")]
	pub average_regions: f64, // the average number of regions partecipating in any edition
	pub editions: Vec<EditionInfo>,
	#[serde(rename="regions")]
	pub total_regions: u32, // well unless new regions are created this should cap at 21
	#[serde(rename="instnum")]
	pub total_schools: u32, // i don't think this is UNIQUE schools
	#[serde(rename="teams")]
	pub total_teams: u32,
	#[serde(rename="points")]
	pub total_points: u32,
	#[serde(rename="tasks")]
	pub total_tasks: u32
}

#[derive(Deserialize)]
pub struct Task {
	pub name: String,
	pub title: String
}

#[derive(Deserialize)]
pub struct Round {
	#[serde(rename="id")]
	pub index_str: String, // like "1"
	#[serde(rename="name")]
	pub id_str: String, // like "round1"
	pub title: String, // like "Round 1"
	#[serde(rename="fullscore")]
	pub score_ceiling: u32,
	pub tasks: Vec<Task>
}

#[derive(Deserialize)]
pub struct Team {
	pub id: String,
	pub name: String,
	#[serde(rename="institute")]
	pub school: String,
	#[serde(rename="inst_id")]
	pub school_id: String,
	#[serde(rename="region")]
	pub region_id: String,
	#[serde(rename="fullregion")]
	pub region_name: String,
	#[serde(rename="finalist")]
	pub is_finalist: bool
}

#[derive(Deserialize)]
pub struct FinalsLeaderboard {
	pub rank: u32,
	#[serde(rename="rank_reg")]
	pub regional_rank: u32,
	pub scores: Vec<u32>,
	#[serde(rename="total")]
	pub total_score: u32,
	pub team: Team
}

#[derive(Deserialize)]
pub struct _FinalsLeaderboard_Wrapper {
	pub ranking: Vec<FinalsLeaderboard>
}

#[derive(Deserialize)]
pub struct GlobalLeaderboard {
	#[serde(rename="rank_reg")]
	pub regional_rank: u32,
	#[serde(rename="rank_tot")]
	pub rank: u32,
	#[serde(rename="rank_excl")]
	pub _rank_excl: u32,
	#[serde(rename="rounds")]
	pub round_scores: Vec<u32>,
	#[serde(rename="total")]
	pub total_score: u32,
	pub team: Team
}

#[derive(Deserialize)]
pub struct Edition {
	pub highlights: Vec<Highlight>,
	#[serde(rename="id")]
	pub num_id: u32,
	#[serde(rename="final")]
	pub finals_leaderboard: _FinalsLeaderboard_Wrapper,
	#[serde(rename="rounds")]
	pub global_leaderboard: Vec<GlobalLeaderboard>,
	#[serde(rename="name")]
	pub id_str: String,
	pub title: String,
	#[serde(rename="year")]
	pub year_str: String,
	#[serde(rename="teams")]
	pub total_teams: u32,
	#[serde(rename="contests")]
	pub rounds: Vec<Round>,
	#[serde(rename="regions")]
	pub total_regions: u32,
	#[serde(rename="points")]
	pub total_points: u32,
	#[serde(rename="fullscore")]
	pub score_ceiling: u32,
	#[serde(rename="positive")]
	pub _positive: u32,
	#[serde(rename="highest")]
	pub high_score: u32,
	#[serde(rename="average")]
	pub average_score: f64,
	#[serde(rename="avgpos")]
	pub average_rank: f64,
	#[serde(rename="medpos")]
	pub _medpos: u32,
	#[serde(rename="tasks")]
	pub total_tasks: u32,
	#[serde(rename="instnum")]
	pub total_schools: u32,
	#[serde(rename="lastEd")]
	pub last_edition: u32
}

pub async fn get_competition_info() -> Result<CompetitionInfo, String> {
	let url = "https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.json";
	
	let resp = match reqwest::get(url).await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let raw = match resp.text().await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let dump = match serde_json::from_str(&raw) {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	return Ok(dump);
}

pub async fn get_edition(year: u32) -> Result<Edition, String> {
	let url = format!("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.{}.json", year);

	let resp = match reqwest::get(url).await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let raw = match resp.text().await {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	let dump = match serde_json::from_str(&raw) {
		Ok(v) => v,
		Err(e) => return Err(e.to_string())
	};

	return Ok(dump);
}
