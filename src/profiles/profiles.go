package profiles

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func Get(username string) Profile {
	req := map[string]string{
		"action":   "get",
		"username": username,
	}
	payload, err := json.Marshal(req)
	if err != nil {
		panic(err)
	}

	res, err := http.Post("https://training.olinfo.it/api/user", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}

	var profile Profile
	dec := json.NewDecoder(res.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&profile); err != nil {
		panic(err)
	}

	return profile
}
