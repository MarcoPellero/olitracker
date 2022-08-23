import fetch from "cross-fetch";
import * as misc from "./misc.js";

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

function getInfo(): Promise<GeneralInfo> {
	const url = "https://squadre.olinfo.it/json/edition.json";
	return fetch(url, { headers: { "Content-Type": "application/json" } })
		.then(async (res) => await res.json())
		.catch((err) => { throw new Error(`OIS.getInfo() fetch failed! error: ${err.message}`) });
}

async function getEditions(info: GeneralInfo): Promise<Edition[]> {
	const years: number[] = [];
	for (const ed of info.editions)
		years.push(ed.id);
	years.sort()

	const url = (year: number) => `https://squadre.olinfo.it/json/edition.${year}.json`;
	/* return Promise.all( years.map(y => fetch(url(y))) )
		.then(arr =>
			arr.map(async res => await res.json() as Edition)
			) */
	const arr = await Promise.all( years.map(y => fetch(url(y))) );
	const output: Edition[] = await Promise.all( arr.map(res => res.json()) );

	return output;
}

function getTasks(ed: Edition) {
	Promise.all(ed.contests.map(contest => {
		
	}))
}

async function debug() {
	let start;

	start = performance.now();
	const info = await getInfo();
	console.log(`Time to fetch GeneralInfo: ${performance.now() - start}`);
	console.log(info);

	start = performance.now();
	const eds = await getEditions(info);
	console.log(`Time to fetch Edition[]: ${performance.now() - start}`);
	console.log(eds);
}

debug();