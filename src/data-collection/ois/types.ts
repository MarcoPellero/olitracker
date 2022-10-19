interface InternalEditionGeneric {
	average: number,
	avgpos: number,
	fullscore: number,
	highest: number,
	id: number,
	instnum: number,
	lastEd: number,
	medPos: number,
	name: string,
	points: number,
	positive: number,
	regions: number,
	tasks: number,
	teams: number,
	title: string,
	year: string
}

export interface RoundSpecific {
	id: string,
	name: string,
	title: string,
	fullscore: number,
	tasks: {
		name: string,
		title: string
	}[]
}

export interface EditionGeneric {
	allreg: number,
	avgreg: number,
	editions: InternalEditionGeneric[],
	highlights: {
		id: string,
		name: string,
		description: string
	}[],
	instnum: number,
	points: number,
	regions: number,
	tasks: number,
	teams: number
}

export interface EditionSpecific extends InternalEditionGeneric {
	contests: RoundSpecific[],
	final: {
		ranking: {
			rank: number,
			rank_reg: number,
			scores: number[],
			total: number,
			team: {
				finalist: boolean,
				fullregion: string,
				id: string,
				inst_id: string,
				institute: string,
				name: string,
				region: string
			}
		}[]
	},
	highlights: EditionGeneric["highlights"],
	rounds: {
		rank_reg: number,
		rank_tot: number,
		rank_excl: number,
		rounds: number[],
		total: number,
		team: EditionSpecific["final"]["ranking"][0]["team"]
	}[]
}
