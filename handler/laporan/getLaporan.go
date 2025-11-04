package laporan

import (
	"context"
	"net/http"
	"strconv"

	"api-jumantik/config"
	"api-jumantik/model"

	"github.com/gin-gonic/gin"
)

func GetLaporan(c *gin.Context) {
	// Ambil role dan id dari token
	role := c.GetString("role")
	userHashingID := c.GetString("id")

	// Ambil param ?start= dan ?end=
	startParam := c.Query("start")
	endParam := c.Query("end")

	start, _ := strconv.Atoi(startParam)
	end, _ := strconv.Atoi(endParam)
	if start < 0 {
		start = 0
	}
	if end <= 0 {
		end = 20
	}

	// Variabel tambahan untuk kondisi filter RW
	var rwKoordinator int
	var query string
	var rowsData interface{}
	var err error

	// Jika role adalah koordinator → ambil rw dari tabel users berdasarkan hashing_id
	if role == "koordinator" {
		err = config.Pool.QueryRow(context.Background(),
			`SELECT rw FROM users WHERE hashing_id = $1`, userHashingID,
		).Scan(&rwKoordinator)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil RW koordinator"})
			return
		}
		println(rwKoordinator)
		query = `
			SELECT l.id, l.tanggal, l.rt, u.rw, l.detail_alamat,
			       u.nama AS pelapor,
			      l.latitude, l.longitude
			FROM laporan l
			JOIN users u ON l.pelapor = u.hashing_id
			WHERE u.rw = $1
			ORDER BY l.id desc
			OFFSET $2 LIMIT $3
		`
		rowsData, err = config.Pool.Query(context.Background(), query, rwKoordinator, start, end)
	} else {
		// Role bukan koordinator → ambil semua
		query = `
			SELECT l.id, l.tanggal, l.rt, u.rw, l.detail_alamat,
			       u.nama AS pelapor,
			      l.latitude, l.longitude
			FROM laporan l
			JOIN users u ON l.pelapor = u.hashing_id
			ORDER BY l.id desc
			OFFSET $1 LIMIT $2
		`
		rowsData, err = config.Pool.Query(context.Background(), query, start, end)
		println("masuk sini")
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}
	rows := rowsData.(interface {
		Close()
		Next() bool
		Scan(dest ...interface{}) error
	})
	defer rows.Close()

	var data []model.LaporanResponse
	for rows.Next() {
		var d model.LaporanResponse
		if err := rows.Scan(&d.Id, &d.Tanggal, &d.Rt, &d.Rw, &d.DetailAlamat, &d.Pelapor, &d.Latitude, &d.Longitude); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		data = append(data, d)
	}

	// Hitung total data
	var totalData int
	if role == "koordinator" {
		err = config.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM laporan l
			 JOIN users u ON l.pelapor = u.hashing_id
			 WHERE u.rw = $1`, rwKoordinator,
		).Scan(&totalData)
	} else {
		err = config.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM laporan`,
		).Scan(&totalData)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal hitung total"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_data": totalData,
		"data":       data,
	})
}
