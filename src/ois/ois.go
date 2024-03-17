package ois

import (
	"encoding/json"
	"fmt"
	"log"
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

func getEdition(id int) (edition, int) {
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

func getEditions() []edition {
	// we might overshoot, so we might have to truncate our edition slice later
	lastId := lastEditionId()
	nEds := lastId - firstEditionId + 1

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

func exportEditions(eds []edition) []types.Competition {
	comps := make([]types.Competition, len(eds))

	for i, ed := range eds {
		// "2014/15" -> 2014
		year, err := strconv.Atoi(strings.Split(ed.YearStr, "/")[0])
		if err != nil {
			panic(err)
		}

		comps[i].Name = fmt.Sprintf("OIS%d", ed.Id)
		comps[i].Contests = make([]types.Contest, len(ed.Rounds))

		for j, r := range ed.Rounds {
			comps[i].Contests[j].Year = year
			comps[i].Contests[j].Tasks = make([]types.Task, len(r.Tasks))

			for k, t := range r.Tasks {
				comps[i].Contests[j].Tasks[k].Name = t.Name
				url := fmt.Sprintf("https://training.olinfo.it/#/task/ois_%s", t.Name)
				comps[i].Contests[j].Tasks[k].Link = &url
			}

		}
	}

	return comps
}

func Get() []types.Competition {
	return exportEditions(getEditions())
}
