package konten

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func UpdateKonten(c *gin.Context) {
	id := c.Param("id")
	hashId := c.GetString("id")

	var input model.UpdateKonten
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	_, err := config.Pool.Exec(context.Background(),
		`UPDATE konten SET judul = $1, deskripsi = $2, gambar = $3, petugas = $4 WHERE id = $5`,
		input.Judul, input.Deskripsi, input.Gambar, hashId, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update konten"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil diperbarui"})
}
