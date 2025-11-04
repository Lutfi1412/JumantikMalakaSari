package main

import (
	"api-jumantik/config"
	"api-jumantik/handler"
	"api-jumantik/middleware"

	"api-jumantik/handler/konten"
	"api-jumantik/handler/laporan"
	"api-jumantik/handler/surat"
	"api-jumantik/handler/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.Init()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// login tanpa middleware
	r.POST("/login", user.LoginUser)
	r.POST("/check-token", handler.CheckToken)

	// grup autentikasi
	authGroup := r.Group("/auth")
	authGroup.Use(middleware.Auth())
	{
		// --- USER ---
		authGroup.POST("/create-user", user.CreateUser)
		authGroup.PUT("/update-user/:id", user.UpdateUser)
		authGroup.GET("/get-user", user.GetUser)
		authGroup.DELETE("/delete-user/:id", user.DeleteUser)

		// --- LAPORAN ---
		authGroup.POST("/create-laporan", laporan.CreateLaporan)
		authGroup.GET("/laporan", laporan.GetLaporan)
		authGroup.PUT("/update-laporan/:id", laporan.UpdateLaporan)
		authGroup.DELETE("/delete-laporan", laporan.DeleteLaporan)
		authGroup.GET("/get-rt", laporan.GetRT)
		authGroup.GET("/get-gambar/:id", laporan.GetGambar)

		// --- KONTEN ---
		authGroup.POST("/create-konten", konten.CreateKonten)
		authGroup.GET("/get-konten", konten.GetKonten)
		authGroup.PUT("/update-konten/:id", konten.UpdateKonten)
		authGroup.DELETE("/delete-konten/:id", konten.DeleteKonten)

		// --- SURAT---
		authGroup.POST("/create-surat", surat.CreateSurat)
		authGroup.PUT("/update-surat/:id", surat.UpdateSurat)
		authGroup.DELETE("/delete-surat/:id", surat.DeleteSurat)
	}

	r.Run("0.0.0.0:8080")
}
