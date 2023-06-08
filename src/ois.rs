use reqwest;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct Highlight {
	pub id: String,
	#[serde(rename="name")]
	pub team: String,
	pub description: String
}

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
pub struct Task {
	#[serde(deserialize_with="task_name_serializer")]
	pub name: String,
	/*
	in ois11, there was a task named "23".
	now, you'd think the API would give back "23", but no.
	it's coded in javascript, so of fucking course it gives back the literal integer 23.
	and that fucking crashes this code if i don't use a custom deserializer.
	I HATE JAVASCRIPT AASDFASDASDF
	*/
	pub title: String
}

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
pub struct FinalsLeaderboard {
	pub rank: u32,
	#[serde(rename="rank_reg")]
	pub regional_rank: u32,
	pub scores: Vec<u32>,
	#[serde(rename="total")]
	pub total_score: u32,
	pub team: Team
}

#[derive(Deserialize, Debug)]
pub struct _FinalsLeaderboard_Wrapper {
	pub ranking: Vec<FinalsLeaderboard>
}

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
pub struct RoundInfo {
	pub highlights: Vec<Highlight>,
	#[serde(rename="id")]
	pub id_str: String,
	pub name: String,
	pub title: String,
	#[serde(rename="teams")]
	pub total_teams: u32,
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
	#[serde(rename="lastEd")]
	pub last_edition: u32,
	pub edition: String,
	pub tasks: Vec<Task>,
	#[serde(rename="lastRound")]
	pub last_round: String, // can be a number ("3"), but also a string ("final")
	pub ed_num: u32,
	#[serde(rename="provisional")]
	pub _provisional: bool
}

// to understand why this exists, refer to Task's definition
// TLDR: fuck javascript
// PS: i stole this code from a mix of a blog post and chatgpt
fn task_name_serializer<'de, D>(deserializer: D) -> Result<String, D::Error>
where
	D: serde::de::Deserializer<'de>,
{
	let value: serde_json::Value = Deserialize::deserialize(deserializer)?;

	return match value {
		serde_json::Value::String(s) => Ok(s),
		serde_json::Value::Number(n) => Ok(n.to_string()),
		_ => Err(serde::de::Error::custom("Invalid name value")),
	};
}

pub async fn get_info() -> Result<CompetitionInfo, String> {
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

pub async fn get_edition_rounds(ed_num: u32) -> Result<Edition, String> {
	let url = format!("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.{}.json", ed_num);

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

pub async fn get_round(ed_num: u32, round: &str) -> Result<RoundInfo, String> {
	// round is a string because it may be a number ("3") but it may refer to finals ("final")

	let url = format!("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.{}.round.{}.json", ed_num, round);

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

pub async fn get_edition(ed_num: u32) -> Result<Edition, String> {
	return get_edition_rounds(ed_num).await;
}
