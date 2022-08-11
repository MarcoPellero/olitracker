interface UserProfile {
	success: number, // whether the request was successful or not
	access_level: number,
	global_access_level: number
	first_name: string | null, // i'm not sure but i think it might be null too if unavailable
	last_name: string | null,
	username: string,
	mail_hash: string,
	join_date: EpochTimeStamp,
	tasks_solved: number,
	score: number,
	scores: Array<{
		name: string,
		title: string,
		score: number
	}>
}

async function getProfile(username: string) {
	const url = "http://localhost:8080/api/user";
	const payload = {
		action: "get",
		username
	};

	const res = await fetch(
		url,
		{
			method: "post",
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json"
			}
		}
	);
	const data = await res.json();

	if (typeof data == "string")
		return JSON.parse(data);

	if (data.success == 0)
		throw new Error(`Error while grabbing UserProfile by username: ${username}`);

	return data;
}

function profileScores(user: UserProfile) {
	const scores: {[name: string]: number} = {};

	for (const t of user.scores)
		scores[t.name] = t.score;
	
	return scores;
}

export {
	UserProfile,
	getProfile,
	profileScores,
}