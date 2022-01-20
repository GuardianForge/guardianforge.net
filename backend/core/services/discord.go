package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/pkg/errors"
	"guardianforge.net/core/models"
)

func PostToDiscord(webhook string, embeds []models.DiscordEmbed) error {
	postBody := models.DiscordWebhookPostBody{
		Embeds: embeds,
	}

	j, err := json.Marshal(postBody)
	if err != nil {
		return errors.Wrap(err, "(PostToDiscord) Marshal embed")
	}

	req, err := http.NewRequest("POST", webhook, bytes.NewBuffer(j))
	if err != nil {
		return errors.Wrap(err, "(PostToDiscord) Creating Discord POST request")
	}
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return errors.Wrap(err, "(PostToDiscord) Send to Discord")
	}

	if response.StatusCode < 200 || response.StatusCode > 299 {
		log.Println("(PostToDiscord) json: ", string(j))
		return errors.New(fmt.Sprintf("(PostToDiscord) Sending to Discord failed with status %v", response.Status))
	}
	return nil
}
