import mysql from "mysql2"

// making our interfaces extend mysql.RowDataPacket lets us use our interfaces to type-hint query results
// const [rows] = db.query<Competitions>("query")
// const [[row1, row2]] = db.query<Competitions>("query")

export interface Tasks extends mysql.RowDataPacket {
	id: number,
	contest_id: number,

	title: string,
	link: string
}

export interface Contests extends mysql.RowDataPacket {
	id: number,
	competition_id: number,

	title: string,
	num_of_tasks: number,
	year: number,
	round: number
}

export interface Competitions extends mysql.RowDataPacket {
	id: number,

	title: string,
	first_year: number,
	is_multi_round: boolean
}
