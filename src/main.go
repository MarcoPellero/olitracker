package main

import (
	"log"
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

type CompHandlerCtx struct {
	Name   string
	data   types.Competition
	lock   *sync.RWMutex
	Getter func() (types.Competition, error)
}

func (ctx *CompHandlerCtx) Update() error {
	ctx.lock.Lock()
	defer ctx.lock.Unlock()

	data, err := ctx.Getter()
	if err != nil {
		log.Println(err)
		return err
	}

	ctx.data = data
	return nil
}

func (ctx *CompHandlerCtx) Get() types.Competition {
	ctx.lock.RLock()
	defer ctx.lock.RUnlock()
	return ctx.data
}

func main() {
	router := gin.Default()

	router.StaticFile("/", "/var/www/index.html")
	router.StaticFS("/assets/", http.Dir("/var/www/"))

	// register all comp handlers
	handlers := make([]CompHandlerCtx, 0)

	handlers = append(handlers, CompHandlerCtx{Name: "oii", lock: &sync.RWMutex{}, Getter: oii.Get})
	handlers = append(handlers, CompHandlerCtx{Name: "ois", lock: &sync.RWMutex{}, Getter: ois.Get})

	extraComps := extra.GetList()
	for _, comp := range extraComps {
		nameCopy := comp // need to copy comp, or the value of the last iteration will be used
		handlers = append(handlers, CompHandlerCtx{Name: comp, lock: &sync.RWMutex{}, Getter: func() (types.Competition, error) {
			return extra.Get(nameCopy)
		}})
	}

	// initial data fetch
	var wg sync.WaitGroup
	for i := range handlers {
		wg.Add(1)
		go func(i int) {
			err := handlers[i].Update()
			if err != nil {
				panic(err)
			}
			wg.Done()
		}(i)
	}
	wg.Wait()

	// register periodic handler updaters
	for i := range handlers {
		go func(i int) {
			for {
				// time.Sleep(15 * time.Minute)
				time.Sleep(10 * time.Second)
				handlers[i].Update()
			}
		}(i)
	}

	// register handler routes
	for _, handler := range handlers {
		handler := handler
		router.GET("/api/"+handler.Name, func(c *gin.Context) {
			c.JSON(http.StatusOK, handler.Get())
		})
	}

	router.GET("/api/list", func(c *gin.Context) {
		names := make([]string, len(handlers))
		for i, handler := range handlers {
			names[i] = handler.Name
		}

		c.JSON(http.StatusOK, names)
	})

	router.GET("/api/all", func(c *gin.Context) {
		resp := make([]types.Competition, len(handlers))
		for i, handler := range handlers {
			resp[i] = handler.Get()
		}

		c.JSON(http.StatusOK, resp)
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
