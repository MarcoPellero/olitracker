package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.StaticFile("/", "/var/www/index.html")

	router.Run()
}
