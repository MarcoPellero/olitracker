package oii

import (
	"encoding/json"
	"net/http"

	"olitracker.it/src/types"
)

func getEditions() ([]edition, error) {
	res, err := http.Get("https://raw.githubusercontent.com/algorithm-ninja/oii-stats/master/data/contests.json")
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var dump struct {
		Editions []edition `json:"contests"`
	}

	dec := json.NewDecoder(res.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&dump); err != nil {
		return nil, err
	}

	return dump.Editions, nil
}

func exportEditions(editions []edition) types.Competition {
	comp := types.Competition{
		Name:     "OII",
		Editions: make([]types.Edition, len(editions)),
	}

	for i, inEd := range editions {
		outEd := &comp.Editions[i]
		*outEd = types.Edition{
			Year:     inEd.Year,
			Contests: make([]types.Contest, 1),
		}

		contest := &outEd.Contests[0]
		*contest = types.Contest{
			Tasks: make([]types.Task, len(inEd.Tasks)),
		}

		for j, t := range inEd.Tasks {
			contest.Tasks[j] = types.Task{
				Name: t.Name,
				Link: t.Link,
			}
		}
	}

	return comp
}

func Get() (types.Competition, error) {
	editions, err := getEditions()
	if err != nil {
		return types.Competition{}, err
	}

	return exportEditions(editions), nil
}
