package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"olitracker.it/src/oii"
	"olitracker.it/src/ois"
	"olitracker.it/src/profiles"
	"olitracker.it/src/types"
)

func NewCompHandler(router *gin.Engine, fn func() types.Competition) func(*gin.Context) {
	// returns a handler that accesses periodically refreshed data

	updateInterval := 15 * time.Minute
	data := types.Competition{}
	lock := &sync.RWMutex{}

	go func() {
		for {
			lock.Lock()
			// if this crashes the whole app crashes! TODO: fix?? :)
			data = fn()
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

	router.GET("/api/oii", NewCompHandler(router, oii.Get))
	router.GET("/api/ois", NewCompHandler(router, ois.Get))

	router.GET("/api/scores", func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.String(http.StatusBadRequest, "username is required")
			return
		}

		p := profiles.Get(username)
		if p.Success == 1 {
			c.JSON(http.StatusOK, p)
		} else {
			c.String(http.StatusInternalServerError, *p.Error)
		}
	})

	router.Run()
}
