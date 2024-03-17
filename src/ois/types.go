package ois

type highlight struct {
	Id          string `json:"id"`
	Team        string `json:"name"`
	Description string `json:"description"`
}

type team struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	School     string `json:"institute"`
	SchoolId   string `json:"inst_id"`
	RegionId   string `json:"region"`
	RegionName string `json:"fullregion"`
	Finalist   bool   `json:"finalist"`
}

type finalsLeaderboard struct {
	Rank         int   `json:"rank"`
	RegionalRank int   `json:"rank_reg"`
	Scores       []int `json:"scores"`
	TotalScore   int   `json:"total"`
	Team         team  `json:"team"`
}

type globalLeaderboard struct {
	Rank         int   `json:"rank_tot"`
	RegionalRank int   `json:"rank_reg"`
	RoundScores  []int `json:"rounds"`
	TotalScore   int   `json:"total"`
	Team         team  `json:"team"`
	// i don't know what this represents
	Unk_rank_excl int `json:"rank_excl"`
}

type task struct {
	Name  string `json:"name"`
	Title string `json:"title"`
}

type round struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Title        string `json:"title"`
	ScoreCeiling int    `json:"fullscore"`
	Tasks        []task `json:"tasks"`
}

type edition struct {
	Id                int         `json:"id"`
	Name              string      `json:"name"`
	Title             string      `json:"title"`
	YearStr           string      `json:"year"`
	NumTeams          int         `json:"teams"`
	NumRegions        int         `json:"regions"`
	TotalPoints       int         `json:"points"`
	ScoreCeiling      int         `json:"fullscore"`
	HighScore         int         `json:"highest"`
	AverageScore      float32     `json:"average"`
	AverageRank       float32     `json:"avgpos"`
	Highlights        []highlight `json:"highlights"`
	NumTasks          int         `json:"tasks"`
	NumSchools        int         `json:"instnum"`
	LastEdId          int         `json:"lastEd"`
	FinalsLeaderboard *struct {
		Ranking []finalsLeaderboard `json:"ranking"`
	} `json:"final"`
	Rounds            []round             `json:"contests"`
	GlobalLeaderboard []globalLeaderboard `json:"rounds"`

	// i don't know what these represent
	Unk_positive int `json:"positive"`
	Unk_medpos   int `json:"medpos"`
}
