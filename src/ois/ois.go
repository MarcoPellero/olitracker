package ois

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"olitracker.it/src/types"
)

const firstEditionId = 6
const firstYear = 2015

func lastEditionId() int {
	// may be off by 1 or 2 :D it's not worth doing an extra request just to get this right

	/* i add 1 in case this is 'off' in the wrong direction, and doesn't show the latest edition
	   it might have been a problem for example if an edition started late in the year
	*/
	return time.Now().Year() - firstYear + firstEditionId + 1
}

func getFinalRound(id int) (round, int, error) {
	url := fmt.Sprintf("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.%d.round.final.json", id)
	res, err := http.Get(url)
	if err != nil {
		return round{}, 0, err
	}

	// non-existant edition
	if res.StatusCode != http.StatusOK {
		return round{}, res.StatusCode, nil
	}

	var r round
	dec := json.NewDecoder(res.Body)

	// singular rounds have more fields than a single round would in an edition fetch (edition.x.json vs edition.x.roud.y.json)
	// it still has the data we need and i don't wanna type this data out again, so fuck it :)
	// dec.DisallowUnknownFields()

	if err := dec.Decode(&r); err != nil {
		return round{}, 0, nil
	}

	return r, http.StatusOK, nil
}

func getMainEditionData(id int) (edition, int, error) {
	url := fmt.Sprintf("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.%d.json", id)
	res, err := http.Get(url)
	if err != nil {
		return edition{}, 0, err
	}

	// non-existant edition
	if res.StatusCode != http.StatusOK {
		return edition{}, res.StatusCode, nil
	}

	var ed edition
	dec := json.NewDecoder(res.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&ed); err != nil {
		return edition{}, 0, nil
	}

	return ed, http.StatusOK, nil
}

func getEdition(id int) (edition, int, error) {
	// these can be done concurrently (i used to) but it makes for uglier code; they're single fast requests anyway
	ed, edStatus, err := getMainEditionData(id)
	if err != nil {
		return edition{}, 0, err
	}
	if edStatus != http.StatusOK {
		return edition{}, edStatus, nil
	}

	round, roundStatus, err := getFinalRound(id)
	if err != nil {
		return edition{}, 0, err
	}
	if roundStatus != http.StatusOK {
		return edition{}, roundStatus, nil
	}

	ed.Rounds = append(ed.Rounds, round)
	return ed, http.StatusOK, nil
}

func getEditions() ([]edition, error) {
	// we might overshoot, so we might have to truncate our edition slice later
	lastId := lastEditionId()
	nEds := lastId - firstEditionId + 1

	editions := make([]edition, nEds)
	statuses := make([]int, nEds)
	errors := make([]error, nEds)
	var wg sync.WaitGroup
	for i := 0; i < nEds; i++ {
		wg.Add(1)
		go func(i int) {
			editions[i], statuses[i], errors[i] = getEdition(firstEditionId + i)
			wg.Done()
		}(i)
	}
	wg.Wait()

	// bin all the data if there's even a single error
	for i, err := range errors {
		if err != nil {
			return nil, fmt.Errorf("error fetching edition %d: %w", firstEditionId+i, err)
		}
	}

	// truncate editions slice if we overshot
	if statuses[nEds-1] == http.StatusNotFound {
		nEds--
		editions = editions[:nEds]
		statuses = statuses[:nEds]
	}
	// i think it could overshoot by 2 years
	if statuses[nEds-1] == http.StatusNotFound {
		nEds--
		editions = editions[:nEds]
		statuses = statuses[:nEds]
	}

	for i, status := range statuses {
		if status != http.StatusOK {
			// this should never happen
			return nil, fmt.Errorf("got non-OK http status when fetching edition %d: %d", firstEditionId+i, status)
		}
	}

	return editions, nil
}

func exportEditions(inEds []edition) types.Competition {
	comp := types.Competition{
		Name:     "OIS",
		Editions: make([]types.Edition, len(inEds)),
	}

	for i, inEd := range inEds {
		// "2014/15" -> 2014
		year, err := strconv.Atoi(strings.Split(inEd.YearStr, "/")[0])
		if err != nil {
			panic(err) // this is a pretty serious error; the data format must've changed. i'm ok with panicking here
		}

		outEd := &comp.Editions[i]
		*outEd = types.Edition{
			Year:     year,
			Contests: make([]types.Contest, len(inEd.Rounds)),
		}

		for j, r := range inEd.Rounds {
			contest := &outEd.Contests[j]
			*contest = types.Contest{
				Tasks: make([]types.Task, len(r.Tasks)),
			}

			for k, t := range r.Tasks {
				url := fmt.Sprintf("https://training.olinfo.it/#/task/ois_%s", t.Name)
				contest.Tasks[k] = types.Task{
					Name: t.Name,
					Link: &url,
				}
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
