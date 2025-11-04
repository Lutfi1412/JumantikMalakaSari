package util

import (
	"crypto/sha256"
	"encoding/hex"
)

func HashUsername(username string) string {
	hash := sha256.Sum256([]byte(username))
	return hex.EncodeToString(hash[:])
}
