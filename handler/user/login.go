package user

import (
	"context"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"
	"api-jumantik/util"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginUser(c *gin.Context) {

	if c.Request.Method != http.MethodPost {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"message": "Method not allowed"})
		return
	}
	var input model.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var hashedPassword, role, id string

	usernameHash := util.HashUsername(input.Username)

	query := `SELECT hashing_id, password, role FROM users WHERE username = $1`
	err := config.Pool.QueryRow(context.Background(), query, usernameHash).Scan(&id, &hashedPassword, &role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	token, err := util.GenerateToken(id, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	if c.GetHeader("Content-Type") != "application/json" {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "invalid header"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
