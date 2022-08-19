export interface Task {
	name: string,
	id: any, // any unique data about a certain task
	link: null | string,
	score: null | number,
	max_score_possible: null | number
}

export interface Event { // any competition event like IOI2021
	year: number,
	tasks: Task[]
}

export interface userData {
	user: undefined | string,
	password: undefined | string
};

export interface CompHandler {
	name: string,
	getTasks(data: userData): Promise<Event[]>
}

export const range = (from: number, to: number) => Array.from({length: to-from}, (x, i) => from + i);