package user

import (
	"context"
	"errors"
	"net/http"

	"api-jumantik/config"
	"api-jumantik/model"
	"api-jumantik/util"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgconn"
	"golang.org/x/crypto/bcrypt"
)

func CreateUser(c *gin.Context) {
	if c.Request.Method != http.MethodPost {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not allowed"})
		return
	}

	if c.GetHeader("Content-Type") != "application/json" {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "Invalid header, use application/json"})
		return
	}

	var input model.CreateUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	role := c.GetString("role")
	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if input.Role != "admin" && input.Role != "koordinator" && input.Role != "petugas" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid role"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	var id int

	usernameHash := util.HashUsername(input.Username)

	var exists bool
	err = config.Pool.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM users WHERE username=$1)", usernameHash).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal cek username"})
		return
	}
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username sudah digunakan"})
		return
	}

	query := `
    INSERT INTO users (nama, rt, rw, role, username, password)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`
	err = config.Pool.QueryRow(context.Background(), query,
		input.Nama,
		input.Rt,
		input.Rw,
		input.Role,
		usernameHash,
		string(hashedPassword),
	).Scan(&id)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "users_username_key" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Username sudah digunakan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	hashingID, err := bcrypt.GenerateFromPassword([]byte(string(id)), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	_, err = config.Pool.Exec(context.Background(),
		`UPDATE users SET hashing_id = $1 WHERE id = $2`,
		hashingID, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User created successfully",
	})
}
