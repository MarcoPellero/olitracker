package types

/* this package defines a standard type that each competition gets normalized to
   it's all that the frontend needs to know about the competition
*/

type Task struct {
	Name string  `json:"name"`
	Link *string `json:"link"`
}

type Contest struct {
	Year  int    `json:"year"`
	Round *int   `json:"round"` // oii doesn't have rounds; ois does
	Tasks []Task `json:"tasks"`
}

type Competition struct {
	Name     string    `json:"name"`
	Contests []Contest `json:"contests"`
}
