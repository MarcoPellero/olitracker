package types

/* this package defines a standard type that each competition gets normalized to
   it's all that the frontend needs to know about the competition
*/

type Task struct {
	Name string  `json:"name"`
	Link *string `json:"link"`
}

// OII2019, OIS2019round1, OIS2019round2, etc
type Contest struct {
	Tasks []Task `json:"tasks"`
}

// OII2019, OIS2019, etc
type Edition struct {
	Year     int       `json:"year"`
	Contests []Contest `json:"contests"`
}

// OII and OIS
type Competition struct {
	Name     string    `json:"name"`
	Editions []Edition `json:"editions"`
}
