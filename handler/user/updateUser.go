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

func UpdateUser(c *gin.Context) {
	hashingID := c.Param("id")
	hashingID = `\` + hashingID
	role := c.GetString("role")

	if c.GetHeader("Content-Type") != "application/json" {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"message": "Invalid header, use application/json"})
		return
	}

	var newPassword string

	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var input model.UpdateUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	usernameHash := util.HashUsername(input.UserName)
	newPassword = input.PasswordNew
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	// Update ke database
	_, err = config.Pool.Exec(context.Background(),
		`UPDATE users SET password = $1, username = $2 WHERE hashing_id = $3`,
		string(hashedPassword), usernameHash, hashingID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
