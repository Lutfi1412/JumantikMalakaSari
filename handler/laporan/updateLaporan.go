package laporan

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func UpdateLaporan(c *gin.Context) {
	laporanID := c.Param("id")
	userHashingID := c.GetString("id")

	role := c.GetString("role")

	if role == "warga" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var input model.UpdateLaporan
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Ambil nama & role user berdasarkan hashing_id dari token
	queryUpdate := `
		UPDATE laporan 
		SET detail_alamat = $1, pelapor = $2
		WHERE id = $3
	`
	result, err := config.Pool.Exec(context.Background(), queryUpdate, input.DetailAlamat, userHashingID, laporanID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Laporan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan berhasil diperbarui",
	})
}
