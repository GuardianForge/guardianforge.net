package models

import "guardianforge.net/core/db/models"

type AlgoliaBuildRecord struct {
	ObjectID        string              `json:"objectID"`
	Name            string              `json:"name"`
	PlayerDetails   string              `json:"playerDetails"`
	Notes           string              `json:"notes"`
	Class           int                 `json:"class"`
	Subclass        int                 `json:"subclass"`
	PrimaryActivity string              `json:"primaryActivity"`
	InputStyle      string              `json:"inputStyle"`
	ItemHashes      []int               `json:"itemHashes"`
	ItemNames       string              `json:"itemNames"`
	Summary         models.BuildSummary `json:"summary"`
}
