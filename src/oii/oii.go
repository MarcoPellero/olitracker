package oii

import (
	"encoding/json"
	"net/http"

	"olitracker.it/src/types"
)

func getContests() []contest {
	res, err := http.Get("https://raw.githubusercontent.com/algorithm-ninja/oii-stats/master/data/contests.json")
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	var dump struct {
		Contests []contest `json:"contests"`
	}

	dec := json.NewDecoder(res.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&dump); err != nil {
		panic(err)
	}

	return dump.Contests
}

func exportContests(contests []contest) types.Competition {
	var comp types.Competition
	comp.Name = "OII"
	comp.Contests = make([]types.Contest, len(contests))

	for i, c := range contests {
		comp.Contests[i].Year = c.Year
		comp.Contests[i].Tasks = make([]types.Task, len(c.Tasks))

		for j, t := range c.Tasks {
			comp.Contests[i].Tasks[j].Name = t.Name
			comp.Contests[i].Tasks[j].Link = t.Link
		}
	}

	return comp
}

func GetCompetition() types.Competition {
	return exportContests(getContests())
}
