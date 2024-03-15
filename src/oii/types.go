package oii

type navigation struct {
	Year int  `json:"current"`
	Prev *int `json:"previous"`
	Next *int `json:"next"`
}

type location struct {
	Name      *string  `json:"location"`
	Link      *string  `json:"gmaps"`
	Latitude  *float32 `json:"latitude"`
	Longitude *float32 `json:"longitude"`
}

type medal struct {
	Count  *int     `json:"count"`
	Cutoff *float32 `json:"cutoff"`
}

type task struct {
	Year         int      `json:"contest_year"`
	Name         string   `json:"name"`
	Title        string   `json:"title"`
	Link         *string  `json:"link"`
	Index        int      `json:"index"`
	ScoreCeiling *float32 `json:"max_score_possible"`
}

type contest struct {
	Year         int              `json:"year"`
	Nav          navigation       `json:"navigation"`
	Place        location         `json:"location"`
	Region       *string          `json:"region"`
	Contestants  int              `json:"num_contestants"`
	ScoreCeiling *float32         `json:"max_score_possible"`
	HighScore    *float32         `json:"max_score"`
	AverageScore *float32         `json:"avg_score"`
	Tasks        []task           `json:"tasks"`
	Medals       map[string]medal `json:"medals"`
}
