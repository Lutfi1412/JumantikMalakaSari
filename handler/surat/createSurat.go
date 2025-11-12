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
	role := c.GetString("role")
	userHashingID := c.GetString("id")

	if role != "koordinator" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Tidak diizinkan. Hanya koordinator yang dapat membuat surat."})
		return
	}
	var surat model.CreateSurat
	if err := c.ShouldBindJSON(&surat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format data tidak valid"})
		return
	}

	var userRW int
	err := config.Pool.QueryRow(context.Background(),
		`SELECT rw FROM users WHERE hashing_id = $1`, userHashingID,
	).Scan(&userRW)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Data pengguna tidak ditemukan atau tidak valid"})
		return
	}

	var rwTanggal int
	err = config.Pool.QueryRow(context.Background(),
		`SELECT rw FROM tanggal WHERE id = $1`, surat.TanggalID,
	).Scan(&rwTanggal)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tanggal tidak ditemukan"})
		return
	}

	if rwTanggal != userRW {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Tidak diizinkan mengakses data RW lain"})
		return
	}

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
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengonversi data jumlah ke format JSON"})
		return
	}

	jenisTatananJSON, err := json.Marshal(surat.JenisTatanan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengonversi data jenis tatanan ke format JSON"})
		return
	}

	// 🧾 Simpan ke database
	query := `
	INSERT INTO surat (tanggal_id, rt, total_bangunan, total_jentik, abj, jumlah, jenis_tatanan)
	VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
	`
	_, err = config.Pool.Exec(
		context.Background(),
		query,
		surat.TanggalID,
		surat.RT,
		surat.TotalBangunan,
		surat.TotalJentik,
		surat.ABJ,
		string(jumlahJSON),
		string(jenisTatananJSON),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data surat ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Surat berhasil dibuat"})
}
