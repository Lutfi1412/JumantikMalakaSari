package surat

import (
	"api-jumantik/config"
	"api-jumantik/model"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteTanggal(c *gin.Context) {
	role := c.GetString("role")

	// hanya admin dan koordinator yang boleh hapus
	if role != "admin" && role != "koordinator" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// ambil array id dari body: { "ids": [1,2,3] }
	var input model.DeleteTanggal

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format data tidak valid"})
		return
	}

	if len(input.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tidak ada ID yang dikirim"})
		return
	}

	// hapus semua laporan dengan id yang dikirim
	query := `DELETE FROM tanggal WHERE id = ANY($1)`
	result, err := config.Pool.Exec(context.Background(), query, input.IDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus tanggal"})
		return
	}

	rows := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Tidak ada laporan yang dihapus"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan berhasil dihapus",
	})
}
