package laporan

import (
	"context"
	"net/http"
	"time"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func CreateLaporan(c *gin.Context) {
	hashingID := c.GetString("id")

	var input model.CreateLaporan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Ambil tanggal saat ini di zona waktu Jakarta
	loc, _ := time.LoadLocation("Asia/Jakarta")
	now := time.Now().In(loc)

	query := `
	INSERT INTO laporan (
		tanggal, rt, detail_alamat, pelapor, gambar, latitude, longitude
	) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := config.Pool.Exec(context.Background(), query,
		now.Format("2006-01-02"),
		input.Rt,
		input.DetailAlamat,
		hashingID,
		input.Gambar,
		input.Latitude,
		input.Longitude,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan berhasil dibuat",
	})
}
