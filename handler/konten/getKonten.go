package konten

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func GetKonten(c *gin.Context) {
	rows, err := config.Pool.Query(context.Background(), `
		SELECT 
			k.id,
			k.judul,
			k.deskripsi,
			k.gambar,
			COALESCE(u.nama, '') AS petugas
		FROM konten k
		LEFT JOIN users u ON k.petugas = u.hashing_id
		ORDER BY k.id DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	defer rows.Close()

	var kontenList []model.Konten
	for rows.Next() {
		var k model.Konten
		if err := rows.Scan(&k.ID, &k.Judul, &k.Deskripsi, &k.Gambar, &k.Petugas); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error membaca data"})
			return
		}
		kontenList = append(kontenList, k)
	}

	c.JSON(http.StatusOK, gin.H{"data": kontenList})
}
