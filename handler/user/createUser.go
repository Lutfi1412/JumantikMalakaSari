package user

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"api-jumantik/config"
	"api-jumantik/model"
	"api-jumantik/util"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgconn"
	"golang.org/x/crypto/bcrypt"
)

func CreateUser(c *gin.Context) {
	// 1) Method guard (opsional jika router sudah POST-only)
	if c.Request.Method != http.MethodPost {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"message": "Metode tidak diizinkan"})
		return
	}

	// 2) Content-Type tolerant check (bisa mengandung ; charset=utf-8)
	ct := c.GetHeader("Content-Type")
	if ct == "" || !strings.HasPrefix(strings.ToLower(ct), "application/json") {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"message": "Header tidak valid, gunakan application/json"})
		return
	}

	// 3) Bind & basic validation
	var input model.CreateUser
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input data tidak valid"})
		return
	}

	// 4) Authorization (ambil dari context yang diisi middleware)
	role := c.GetString("role")
	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// 5) Validasi role yang boleh dibuat
	switch input.Role {
	case "admin", "koordinator", "petugas":
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Peran (role) tidak valid"})
		return
	}

	// 6) Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengenkripsi password"})
		return
	}

	// 7) Cek username unik (disimpan dalam bentuk hash username)
	usernameHash := util.HashUsername(input.Username)

	var exists bool
	if err := config.Pool.
		QueryRow(c.Request.Context(), `SELECT EXISTS(SELECT 1 FROM users WHERE username=$1)`, usernameHash).
		Scan(&exists); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Terjadi kesalahan saat memeriksa username"})
		return
	}
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username sudah terdaftar"})
		return
	}

	// 8) Insert user
	var id int
	const qInsert = `
		INSERT INTO users (nama, rt, rw, role, username, password, nama_rw)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id;
	`
	err = config.Pool.QueryRow(
		c.Request.Context(),
		qInsert,
		input.Nama,
		input.Rt,
		input.Rw,
		input.Role,
		usernameHash,
		string(hashedPassword),
		input.NamaRW,
	).Scan(&id)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "users_username_key" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Username sudah digunakan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data pengguna"})
		return
	}

	// 9) Buat hashing_id dari ID yang benar (pakai strconv.Itoa, bukan string(id))
	hashingID, err := bcrypt.GenerateFromPassword([]byte(strconv.Itoa(id)), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat ID pengguna"})
		return
	}

	if _, err := config.Pool.Exec(
		c.Request.Context(),
		`UPDATE users SET hashing_id = $1 WHERE id = $2`,
		hashingID, id,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data pengguna"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pengguna berhasil dibuat",
		// "id":      id, // aktifkan jika ingin mengembalikan id
	})
}
