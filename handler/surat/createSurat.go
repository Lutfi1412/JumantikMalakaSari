package surat

import (
	"api-jumantik/config"
	"api-jumantik/model"
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateSurat(c *gin.Context) {
	userHashingID := c.GetString("id")
	role := c.GetString("role")

	if role != "koordinator" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// 🔹 Ambil RW dari users berdasarkan hashing_id
	var rw int
	err := config.Pool.QueryRow(
		context.Background(),
		"SELECT rw FROM users WHERE hashing_id=$1",
		userHashingID,
	).Scan(&rw)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User tidak ditemukan"})
		return
	}

	// 🔹 Bind JSON request
	var surat model.CreateSurat
	if err := c.ShouldBindJSON(&surat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔹 Hitung total_bangunan dan total_jentik otomatis dari jenis_tatanan
	totalBangunan := surat.JenisTatanan.RumahTangga.Dikunjungi +
		surat.JenisTatanan.Perkantoran.Dikunjungi +
		surat.JenisTatanan.InstPendidikan.Dikunjungi +
		surat.JenisTatanan.TTU.Dikunjungi +
		surat.JenisTatanan.FasOlahraga.Dikunjungi +
		surat.JenisTatanan.TPM.Dikunjungi +
		surat.JenisTatanan.FasKesehatan.Dikunjungi

	totalJentik := surat.JenisTatanan.RumahTangga.Positif +
		surat.JenisTatanan.Perkantoran.Positif +
		surat.JenisTatanan.InstPendidikan.Positif +
		surat.JenisTatanan.TTU.Positif +
		surat.JenisTatanan.FasOlahraga.Positif +
		surat.JenisTatanan.TPM.Positif +
		surat.JenisTatanan.FasKesehatan.Positif

	surat.TotalBangunan = totalBangunan
	surat.TotalJentik = totalJentik

	// 🔹 Hitung ABJ otomatis
	if totalBangunan > 0 {
		surat.ABJ = float32(float64(totalBangunan-totalJentik) / float64(totalBangunan) * 100)
	}

	// 🔹 Marshal JSON
	jumlahJSON, err := json.Marshal(surat.Jumlah)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal konversi jumlah ke JSON"})
		return
	}

	jenisTatananJSON, err := json.Marshal(surat.JenisTatanan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal konversi jenis_tatanan ke JSON"})
		return
	}

	// 🧾 Simpan ke database
	query := `
	INSERT INTO surat (tanggal, rt, rw, total_bangunan, total_jentik, abj, jumlah, jenis_tatanan)
	VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)
	`
	_, err = config.Pool.Exec(
		context.Background(),
		query,
		surat.Tanggal,
		surat.RT,
		rw,
		surat.TotalBangunan,
		surat.TotalJentik,
		surat.ABJ,
		string(jumlahJSON),
		string(jenisTatananJSON),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Surat berhasil disimpan"})
}
