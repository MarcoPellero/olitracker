export interface Task {
	name: string,
	id: any, // any unique data about a certain task
	link: null | string,
	score: null | number,
	max_score_possible: null | number
}

export interface ScoresMap {
	[name : string] : number
}

export interface Event { // any competition event like IOI2021
	year: number,
	tasks: Task[]
}

export interface CompetitionInfo {
	code: string,
	name: string,
	round: undefined | number | string
}

export interface ApiQuery {
	comp: string
	user: undefined | string,
	password: undefined | string,
	round: undefined | number
}

export interface CompHandler {
	code: string,
	name: string,
	get_tasks(data: ApiQuery): Promise<Event[]>,
	get_scores(data: ApiQuery): Promise<ScoresMap>,

	has_sub_competitions: boolean,
	get_sub_competitions(): CompetitionInfo[],

	cache_max_age: number // as used for HandlerCache; in ms
}

export interface HandlerCache {[token: string]: {
	// max_age is defined in the handler itself
	timer: number,
	data: Event[]
}}

export const cache_token = (code: string, round: undefined | number | string) => `code=${code}&round=${round}`

export const range = (from: number, to: number, step: number = 1) => {
	const output: number[] = []
	for (let i = from; i != to; i += step)
		output.push(i)
	
	return output
}
