export interface StatsContest {
	pageProps: {
		year: number,
		contest: {
			avg_score: number,
			max_score: number,
			max_score_possible: number,
			num_contestants: number,
			region: unknown,

			location: object,
			medals: object,
			navigation: object,
			tasks: {
				contest_year: number,
				index: number,
				link: string | null,
				max_score_possible: number,
				name: string,
				title: string
			}[]
		},
		results: {
			navigation: object,
			resulsts: object[],
			tasks: string[] // task names without the prefix
		}
	},
	__N_SSG: boolean
}