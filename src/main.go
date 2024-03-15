package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"olitracker.it/src/oii"
)

func main() {
	router := gin.Default()

	router.StaticFile("/", "/var/www/index.html")

	router.GET("/api/oii", func(c *gin.Context) {
		/* this is crazy fast despite seemingly doing a network request,
		   i think gin is caching the result of GetCompetition()
		*/
		c.JSON(http.StatusOK, oii.GetCompetition())
	})

	router.Run()
}
