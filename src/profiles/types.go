package profiles

// the only non-optional field is success T.T
// this is because if the request is unsuccessful, it only returns success & error
type Profile struct {
	AccessLevel       *int         `json:"access_level"`
	GlobalAccessLevel *int         `json:"global_access_level"`
	Name              *string      `json:"first_name"`
	Surname           *string      `json:"last_name"`
	School            *interface{} `json:"institute"`
	SignupEpoch       *float32     `json:"join_date"`
	MailHash          *string      `json:"mail_hash"`
	TotalScore        *int         `json:"score"`
	Scores            *[]struct {
		Name  string `json:"name"`
		Title string `json:"title"`
		Score int    `json:"score"`
	} `json:"scores"`
	TasksSolved *int    `json:"tasks_solved"`
	Username    *string `json:"username"`

	Success int     `json:"success"` // 0 or 1
	Error   *string `json:"error"`
}
