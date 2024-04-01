package ois

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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

func getFinalRound(id int) (round, int) {
	url := fmt.Sprintf("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.%d.round.final.json", id)
	res, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	// non-existant edition
	if res.StatusCode != http.StatusOK {
		return round{}, res.StatusCode
	}

	var round round
	dec := json.NewDecoder(res.Body)

	// singular rounds have more fields than a single round would in an edition fetch (edition.x.json vs edition.x.roud.y.json)
	// it still has the data we need and i don't wanna type this data out again, so fuck it :)
	// dec.DisallowUnknownFields()

	if err := dec.Decode(&round); err != nil {
		panic(err)
	}

	return round, http.StatusOK
}

func getMainEditionData(id int) (edition, int) {
	url := fmt.Sprintf("https://raw.githubusercontent.com/olinfo/squadre/master/json/edition.%d.json", id)
	res, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	// non-existant edition
	if res.StatusCode != http.StatusOK {
		return edition{}, res.StatusCode
	}

	var ed edition
	dec := json.NewDecoder(res.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&ed); err != nil {
		panic(err)
	}

	return ed, http.StatusOK
}

func getEdition(id int) (edition, int) {
	var wg sync.WaitGroup
	var ed edition
	var edStatus int
	var round round
	var roundStatus int

	wg.Add(2)
	go func() {
		ed, edStatus = getMainEditionData(id)
		wg.Done()
	}()
	go func() {
		round, roundStatus = getFinalRound(id)
		wg.Done()
	}()

	wg.Wait()

	if edStatus != http.StatusOK {
		return edition{}, edStatus
	}
	if roundStatus != http.StatusOK {
		return edition{}, roundStatus
	}

	ed.Rounds = append(ed.Rounds, round)
	return ed, http.StatusOK
}

func rawGetEditionsSequential(nEds int) ([]edition, []int) {
	eds := make([]edition, nEds)
	statuses := make([]int, len(eds))
	for i := 0; i < len(eds); i++ {
		eds[i], statuses[i] = getEdition(firstEditionId + i)
	}
	return eds, statuses
}

func rawGetEditionsParallel(nEds int) ([]edition, []int) {
	editions := make([]edition, nEds)
	statuses := make([]int, nEds)
	var wg sync.WaitGroup
	for i := 0; i < nEds; i++ {
		wg.Add(1)
		go func(i int) {
			editions[i], statuses[i] = getEdition(firstEditionId + i)
			wg.Done()
		}(i)
	}
	wg.Wait()

	return editions, statuses
}

func getEditions() []edition {
	// we might overshoot, so we might have to truncate our edition slice later
	lastId := lastEditionId()
	nEds := lastId - firstEditionId + 1

	var editions []edition
	var statuses []int
	if _, present := os.LookupEnv("OIS_SEQUENTIAL"); present {
		editions, statuses = rawGetEditionsSequential(nEds)
	} else {
		editions, statuses = rawGetEditionsParallel(nEds)
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
			log.Panicf("got non-OK http status when fetching edition %d: %d", firstEditionId+i, status)
		}
	}

	return editions
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
			panic(err)
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

func Get() types.Competition {
	return exportEditions(getEditions())
}
