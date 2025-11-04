package model

// Struktur jumlah laporan
type Jumlah struct {
	Jumantik int `json:"jumantik"`
	Melapor  int `json:"melapor"`
}

// Struktur jenis tatanan
type JenisTatanan struct {
	RumahTangga    Tatanan `json:"rumah_tangga"`
	Perkantoran    Tatanan `json:"perkantoran"`
	InstPendidikan Tatanan `json:"inst_pendidikan"`
	TTU            Tatanan `json:"ttu"`
	FasOlahraga    Tatanan `json:"fas_olahraga"`
	TPM            Tatanan `json:"tpm"`
	FasKesehatan   Tatanan `json:"fas_kesehatan"`
}

// Struktur tiap tatanan
type Tatanan struct {
	Dikunjungi int `json:"dikunjungi"`
	Positif    int `json:"positif"`
}

// Data surat
type CreateSurat struct {
	Tanggal       string       `json:"tanggal"`
	RT            int          `json:"rt"`
	RW            int          `json:"rw"`
	TotalBangunan int          `json:"total_bangunan"`
	TotalJentik   int          `json:"total_jentik"`
	ABJ           float32      `json:"abj"`
	Jumlah        Jumlah       `json:"jumlah"`
	JenisTatanan  JenisTatanan `json:"jenis_tatanan"`
}

type UpdateSurat struct {
	Tanggal       string       `json:"tanggal"`
	RT            int          `json:"rt"`
	TotalBangunan int          `json:"total_bangunan"`
	TotalJentik   int          `json:"total_jentik"`
	ABJ           float32      `json:"abj"`
	Jumlah        Jumlah       `json:"jumlah"`
	JenisTatanan  JenisTatanan `json:"jenis_tatanan"`
}
