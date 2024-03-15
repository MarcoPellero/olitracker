package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"olitracker.it/src/oii"
	"olitracker.it/src/ois"
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

	router.Run()
}
