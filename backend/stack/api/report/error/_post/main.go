package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/pkg/errors"
)

var ERROR_RED int = 16196387
var DEBUG_PURPLE int = 12666618

type ErrorFeedback struct {
	Operation    *string `json:"operation"`
	UserId       *string `json:"userId"`
	UserName     *string `json:"userName"`
	MetaInfo     *string `json:"metaInfo"`
	ErrorMessage *string `json:"errorMessage"`
	Stack        *string `json:"stack"`
	UserNote     *string `json:"userNote"`
	ContactInfo  *string `json:"contactInfo"`
}

type DiscordWebhookPostBody struct {
	Embeds []DiscordEmbed `json:"embeds"`
}

type DiscordEmbed struct {
	Title       *string      `json:"title"`
	Description *string      `json:"description"`
	Fields      []EmbedField `json:"fields"`
	Color       *int         `json:"color"`
}

type EmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

func (ef *ErrorFeedback) ToEmbed() DiscordEmbed {
	desc := ""
	title := "New Error Reported"
	embed := DiscordEmbed{
		Title:  &title,
		Color:  &ERROR_RED,
		Fields: []EmbedField{},
	}

	if ef.UserNote != nil {
		desc += fmt.Sprintf("**Note:**\n%v\n", *ef.UserNote)
	}

	if ef.ContactInfo != nil {
		desc += fmt.Sprintf("**Contact:**\n%v\n", *ef.ContactInfo)
	}

	if ef.Stack != nil {
		desc += fmt.Sprintf("```\n%v\n```", *ef.Stack)
	}

	if ef.Operation != nil {
		f := EmbedField{
			Inline: true,
			Name:   "Operation",
			Value:  fmt.Sprintf("%v", *ef.Operation),
		}
		embed.Fields = append(embed.Fields, f)
	}

	if ef.UserId != nil {
		f := EmbedField{
			Inline: true,
			Name:   "User ID",
			Value:  fmt.Sprintf("%v", *ef.UserId),
		}
		embed.Fields = append(embed.Fields, f)
	}

	if ef.UserName != nil {
		f := EmbedField{
			Inline: true,
			Name:   "User Name",
			Value:  fmt.Sprintf("%v", *ef.UserName),
		}
		embed.Fields = append(embed.Fields, f)
	}

	if desc != "" {
		embed.Description = &desc
	}

	return embed
}

func MakeErrorResponse(err error) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		Body: err.Error(),
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
		StatusCode: 500,
	}, err
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var ef ErrorFeedback
	err := json.Unmarshal([]byte(request.Body), &ef)
	if err != nil {
		err = errors.Wrap(err, "Unmarshal request")
		return MakeErrorResponse(err)
	}

	webhook := os.Getenv("DISCORD_ERR_WEBHOOK")
	log.Println(webhook)
	postBody := DiscordWebhookPostBody{
		Embeds: []DiscordEmbed{},
	}
	embed := ef.ToEmbed()
	postBody.Embeds = append(postBody.Embeds, embed)
	j, err := json.Marshal(postBody)
	if err != nil {
		err = errors.Wrap(err, "Marshal embed")
		return MakeErrorResponse(err)
	}

	req, err := http.NewRequest("POST", webhook, bytes.NewBuffer(j))
	if err != nil {
		err = errors.Wrap(err, "Creating Discord POST request")
		return MakeErrorResponse(err)
	}
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		err = errors.Wrap(err, "Send to Discord")
		return MakeErrorResponse(err)
	}

	if response.StatusCode < 200 || response.StatusCode > 299 {
		err = errors.New(fmt.Sprintf("Sending to Discord failed with status %v", response.Status))
		return MakeErrorResponse(err)
	}

	return events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
		StatusCode: 200,
	}, nil
}
