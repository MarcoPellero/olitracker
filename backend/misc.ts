export interface Task {
	name: string,
	title: string,
	link: null | string,
	score: null | number,
	max_score_possible: null | number
}

// {link : score}
export interface Scores { [key : string] : number }

export const range = (from: number, to: number) => Array.from({length: to-from}, (x, i) => from + i);