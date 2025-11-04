package surat

import (
	"api-jumantik/config"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteSurat(c *gin.Context) {
	id := c.Param("id")

	role := c.GetString("role")

	if role != "admin" && role != "koordinator" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	_, err := config.Pool.Exec(context.Background(), "DELETE FROM surat WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}
