package laporan

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func CreateLaporan(c *gin.Context) {
	hashingID := c.GetString("id")

	var input model.CreateLaporan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input data tidak valid"})
		return
	}

	// Ambil tanggal saat ini di zona waktu Jakarta
	// loc, _ := time.LoadLocation("Asia/Jakarta")
	// now := time.Now().In(loc)

	query := `
	INSERT INTO laporan (
		tanggal, rt, detail_alamat, pelapor, gambar, latitude, longitude
	) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := config.Pool.Exec(context.Background(), query,
		// now.Format("2006-01-02"),
		input.Tanggal,
		input.Rt,
		input.DetailAlamat,
		hashingID,
		input.Gambar,
		input.Latitude,
		input.Longitude,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan laporan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan berhasil dibuat",
	})
}
