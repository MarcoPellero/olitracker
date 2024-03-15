package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"olitracker.it/src/oii"
	"olitracker.it/src/ois"
	"olitracker.it/src/profiles"
)

func main() {
	router := gin.Default()

	router.StaticFile("/", "/var/www/index.html")
	router.StaticFS("/assets/", http.Dir("/var/www"))

	router.GET("/api/oii", func(c *gin.Context) {
		// this is really fast (ty github :3) but it could be a ddos vector; needs some caching
		c.JSON(http.StatusOK, oii.Get())
	})

	router.GET("/api/ois", func(c *gin.Context) {
		c.JSON(http.StatusOK, ois.Get())
	})

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
