package extra

import (
	"encoding/json"
	"os"
	"strings"

	"olitracker.it/src/types"
)

const basePath = "extra/competitions/"

func GetList() []string {
	entries, err := os.ReadDir(basePath)
	if err != nil {
		panic(err)
	}

	names := make([]string, len(entries))
	for i, entry := range entries {
		names[i] = strings.TrimSuffix(entry.Name(), ".json")
	}

	return names
}

func Get(name string) types.Competition {
	f, err := os.Open(basePath + name + ".json")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	var comp types.Competition

	dec := json.NewDecoder(f)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&comp); err != nil {
		panic(err)
	}

	return comp
}
