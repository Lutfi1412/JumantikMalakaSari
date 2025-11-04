package konten

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

// 1️⃣ CREATE KONTEN
func CreateKonten(c *gin.Context) {

	id := c.GetString("id")

	var input model.CreateKonten
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// ambil nama petugas dari tabel users

	query := `
        INSERT INTO konten (judul, deskripsi, gambar, petugas)
        VALUES ($1, $2, $3, $4)
    `
	_, err := config.Pool.Exec(context.Background(), query,
		input.Judul, input.Deskripsi, input.Gambar, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil ditambahkan"})
}
