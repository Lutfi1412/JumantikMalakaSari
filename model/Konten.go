package model

type CreateKonten struct {
	Judul     string `json:"judul" binding:"required"`
	Deskripsi string `json:"deskripsi" binding:"required"`
	Gambar    string `json:"gambar" binding:"required"`
}

type UpdateKonten struct {
	Judul     string `json:"judul"`
	Deskripsi string `json:"deskripsi"`
	Gambar    string `json:"gambar"`
}

type Konten struct {
	ID        int    `json:"id"`
	Judul     string `json:"judul"`
	Deskripsi string `json:"deskripsi"`
	Gambar    string `json:"gambar"`
	Petugas   string `json:"petugas"`
}
