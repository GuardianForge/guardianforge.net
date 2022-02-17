package utils

import (
	"encoding/json"

	"github.com/pkg/errors"
)

func ConvertToJsonString(obj interface{}) (string, error) {
	bytes, err := json.Marshal(obj)
	if err != nil {
		return "", errors.Wrap(err, "(ConvertToJsonString) marshal to json bytes")
	}

	return string(bytes), nil
}
