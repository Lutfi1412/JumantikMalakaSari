package model

type CreateLaporan struct {
	Rt           int32  `json:"rt" binding:"required"`
	DetailAlamat string `json:"detail_alamat" binding:"required"`
	Gambar       string `json:"gambar" binding:"required"`
	Latitude     string `json:"latitude" binding:"required"`
	Longitude    string `json:"longitude" binding:"required"`
}

type LaporanResponse struct {
	Id           int    `json:"id"`
	Tanggal      string `json:"tanggal"`
	Rt           int    `json:"rt"`
	Rw           int    `json:"rw"`
	DetailAlamat string `json:"detail_alamat"`
	Pelapor      string `json:"pelapor"`
	Latitude     string `json:"latitude"`
	Longitude    string `json:"longitude"`
}
type UpdateLaporan struct {
	DetailAlamat string `json:"detail_alamat" binding:"required"`
}

type DeleteLaporan struct {
	IDs []int `json:"ids"`
}
