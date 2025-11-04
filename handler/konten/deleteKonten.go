package konten

import (
	"context"
	"net/http"

	"api-jumantik/config"

	"github.com/gin-gonic/gin"
)

func DeleteKonten(c *gin.Context) {
	id := c.Param("id")

	_, err := config.Pool.Exec(context.Background(),
		`DELETE FROM konten WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus konten"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil dihapus"})
}
