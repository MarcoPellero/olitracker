package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"olitracker.it/src/extra"
	"olitracker.it/src/oii"
	"olitracker.it/src/ois"
	"olitracker.it/src/profiles"
	"olitracker.it/src/types"
)

type CompetitionHandler struct {
	Name   string
	Getter func() types.Competition
}

func NewCompHandler(fn func() types.Competition) func(*gin.Context) {
	// returns a handler that accesses periodically refreshed data

	updateInterval := 15 * time.Minute
	data := types.Competition{}
	lock := &sync.RWMutex{}

	go func() {
		for {
			// if this crashes the whole app crashes! TODO: fix?? :)
			local_data := fn()

			lock.Lock()
			data = local_data
			lock.Unlock()

			time.Sleep(updateInterval)
		}
	}()

	return func(c *gin.Context) {
		lock.RLock()
		defer lock.RUnlock()
		c.JSON(http.StatusOK, data)
	}
}

func main() {
	router := gin.Default()

	router.StaticFile("/", "/var/www/index.html")
	router.StaticFS("/assets/", http.Dir("/var/www/"))

	handlers := make([]CompetitionHandler, 0)
	handlers = append(handlers, CompetitionHandler{"oii", oii.Get})
	handlers = append(handlers, CompetitionHandler{"ois", ois.Get})

	extraComps := extra.GetList()
	for _, comp := range extraComps {
		compName := comp // need to copy comp, or the value of the last iteration will be used
		handlers = append(handlers, CompetitionHandler{compName, func() types.Competition {
			return extra.Get(compName)
		}})
	}

	for _, handler := range handlers {
		router.GET("/api/"+handler.Name, NewCompHandler(handler.Getter))
	}

	router.GET("/api/competitions", func(c *gin.Context) {
		names := make([]string, len(handlers))
		for i, handler := range handlers {
			names[i] = handler.Name
		}

		c.JSON(http.StatusOK, names)
	})

	router.GET("/api/scores", func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.String(http.StatusBadRequest, "username is required")
			return
		}

		p := profiles.Get(username)
		if p.Success == 1 {
			scores := profiles.ExportScores(p)
			c.JSON(http.StatusOK, scores)
		} else {
			c.String(http.StatusBadRequest, *p.Error)
		}
	})

	router.Run()
}
