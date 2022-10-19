import axios from "axios"

import * as db_types from "./../db_types"

interface OlinfoProfile {
	access_level: number,
	first_name: string,
	global_access_level: number,
	institute: {},
	join_date: number,
	last_name: string,
	mail_hash: string,
	score: number,
	scores: {
		name: string,
		score: number,
		title: string
	}[],
	success: 0 | 1,
	tasks_solved: number,
	username: string
}

export interface TasksScored extends db_types.Tasks {
	score: number | null
}

export async function fetch_profile(username: string) {
	const url = "https://training.olinfo.it/api/user"
	const profile: OlinfoProfile = await axios.post(
		url,
		{
			action: "get",
			username
		}
	).then(res => res.data)

	return profile
}
