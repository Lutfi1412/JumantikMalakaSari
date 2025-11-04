package user

import (
	"context"
	"net/http"

	"api-jumantik/config"

	"github.com/gin-gonic/gin"
)

func DeleteUser(c *gin.Context) {
	hashingID := c.Param("id")
	hashingID = `\` + hashingID

	if hashingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing user id (hashing_id)"})
		return
	}

	role := c.GetString("role")
	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// Jalankan query delete
	query := `DELETE FROM users WHERE hashing_id = $1`
	result, err := config.Pool.Exec(context.Background(), query, hashingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete user"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
