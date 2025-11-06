package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"api-jumantik/config"
	"api-jumantik/handler"
	"api-jumantik/middleware"

	"api-jumantik/handler/konten"
	"api-jumantik/handler/laporan"
	"api-jumantik/handler/surat"
	"api-jumantik/handler/user"
)

// Router global untuk Vercel
var router *gin.Engine

func init() {
	// Inisialisasi koneksi DB
	config.Init()

	// Mode produksi (disarankan di Vercel)
	gin.SetMode(gin.ReleaseMode)

	// Buat router baru
	router = gin.New()
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	// Middleware CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.POST("/login", user.LoginUser)
	router.POST("/check-token", handler.CheckToken)

	// Grup autentikasi
	authGroup := router.Group("/auth")
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

		// --- SURAT ---
		authGroup.POST("/create-surat", surat.CreateSurat)
		authGroup.PUT("/update-surat/:id", surat.UpdateSurat)
		authGroup.DELETE("/delete-surat", surat.DeleteSurat)
		authGroup.GET("/get-surat-rw", surat.GetSuratRW)
		authGroup.GET("/get-surat-admin", surat.GetSuratAdmin)

		// --- TANGGAL ---
		authGroup.POST("/create-tanggal", surat.CreateTanggal)
		authGroup.DELETE("/delete-tanggal", surat.DeleteTanggal)
		authGroup.PUT("/update-tanggal/:id", surat.UpdateTanggal)
		authGroup.GET("/get-tanggal", surat.GetTanggal)
	}

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API Jumantik is running on Vercel!",
			"status":  "OK",
		})
	})
}

// Entry point untuk Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}
