package handler

import (
	"api-jumantik/model"
	"api-jumantik/util"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CheckToken(c *gin.Context) {
	var req model.CheckToken
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token harus disertakan"})
		return
	}

	token, err := util.ParseToken(req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Token tidak valid", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": token.Role,
	})
}
