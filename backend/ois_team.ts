import axios from "axios"
import * as misc from "./misc.js"
import { get_scores } from "./nationals.js"

interface BaseEdition {
	average: number,
	avgpos: number,
	fullscore: number,
	highest: number,
	id: number,				// this is important! it's the IDth edition
	instnum: number,
	lastEd: number,
	medpos: number,
	name: string,			// `edition${id}`
	points: number,
	positive: number,
	regions: number,
	tasks: number,
	teams: number,
	title: string,			// "13th edition" etc
	year: string			// "2020/2021" etc
}

interface Team {
	finalist: boolean,
	fullregion: string,	// eg: "Emilia-Romagnia"
	region: string,		// eg: "emi"
	id: string,			// team name (eg: "bizeibon")
	inst_id: string,
	institute: string,	// FULL institute name (eg: "Liceo Rambaldi - Valeriani - A. da Imola, Imola")
	name: string		// institute name shortand (eg: "Liceo Valeriani")
}

interface HighLight {
	description: string,	// highlight description (eg: "is the team with the highest average rank")
	id: string,				// team 'id' (eg: "edition/9/team/lom39")
	name: string			// institute name (eg: "Magistrini")
}

interface GeneralInfo {
	allreg: number,
	avgreg: number,
	instnum: number,
	points: number,
	regions: number,
	tasks: number,
	teams: number,
	editions: BaseEdition[],
	highlights: HighLight[]
}

interface Edition extends BaseEdition {
	contests: {
		id: string,		// it's a number... "1", "2", etc...
		name: string,	// `round${id}`  (eg: "round1")
		title: string,	// `Round ${id}` (eg: "Round 1")
		tasks: {		// training.olinfo naming convention (eg: "figonacci" & "Numeri di Figonacci")
			name: string,
			title: string
		}[]
	}[],
	final: {
		ranking: {
			rank: number,
			rank_reg: number,
			total: number,
			scores: number[],
			team: Team
		}[]
	},
	highlights: HighLight[],
	rounds: {
		rank_reg: number,
		rank_tot: number,
		rank_excl: number,
		total: number,
		rounds: number[],
		team: Team
	}[]
}

interface Round  {
	average: number,
	avgpos: number,
	ed_num: number,
	edition: string,
	fullscore: number,
	highest: number,
	id: string,
	lastEd: number,
	lastRound: "final",
	medpos: number,
	name: string,
	points: number,
	positive: number,
	provisional: boolean,
	teams: number,
	title: string,

	highlights: HighLight[],
	ranking:  {
		rank: number,
		rank_reg: number,
		total: number,
		scores: number[],
		team: Team
	}[],
	tasks: {
		name: string,
		title: string
	}[]
}

function get_info(): Promise<GeneralInfo> {
	const url = "https://squadre.olinfo.it/json/edition.json"
	return axios.get(url)
		.then(res => res.data)
		.catch((err) => { throw new Error(`OIS.get_info() fetch failed! error: ${err.message}`) })
}

// somewhat deprecated i don't grab the whole edition anymore, i grab the single rounds
async function get_editions(info: GeneralInfo): Promise<Edition[]> {
	const years: number[] = []
	for (const ed of info.editions)
		years.push(ed.id)
	years.sort((a, b) => b - a)

	const url = (year: number) => `https://squadre.olinfo.it/json/edition.${year}.json`
	const res_arr = await Promise.allSettled(
		years.map(y => axios.get(url(y)) )
	)

	const data_arr: Edition[] = []
	for (const res of res_arr) {
		if (res.status == "rejected")
			continue
		
		data_arr.push(res.value.data)
	}

	return data_arr
}

async function get_round(info: GeneralInfo, round: number | "final"): Promise<misc.Event[]> {
	const years = info.editions.map(ed => ed.id).sort()
	const url = (y: number) => `https://squadre.olinfo.it/json/edition.${y}.round.${round}.json`

	const res_arr = await Promise.allSettled(
		years.map(y => axios.get(url(y)) )
	)

	const data_arr: Round[] = []
	for (const res of res_arr) {
		if (res.status == "rejected")
			continue
		
		data_arr.push(res.value.data)
	}

	return data_arr.map(
		data => ({
			year: data.ed_num,
			tasks: data.tasks.map(task => ({
				name: task.name,
				title: task.title,
				link: `https://training.olinfo.it/#/task/ois_${task.name}/statement`,
				id: `https://training.olinfo.it/#/task/ois_${task.name}/statement`,
				score: null,
				max_score_possible: 100
			}))
		})
	)
}

export async function wrapper(data: misc.UserData, round_filter: number | "final") {
	const info = await get_info()
	const unscored = await get_round(info, round_filter)

	if (data.user !== undefined)
		return await get_scores(data.user, unscored)
	
	return unscored
}

async function debug() {
	let start

	start = performance.now()
	const info = await get_info()
	console.log(`Time to fetch GeneralInfo: ${performance.now() - start}`)

	start = performance.now()
	const tasks = get_round(info, 1)
	console.log(`Time to fetch Event[]: ${performance.now() - start}`)
}

// debug()
