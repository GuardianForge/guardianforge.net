package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/dstotijn/go-notion"
	"guardianforge.net/core/models"
	"guardianforge.net/core/services"
)

func main() {
	lambda.Start(handler)
}

func handler(ctx context.Context, sqsEvent events.SQSEvent) error {
	webhookUrl := os.Getenv("DISCORD_BUILD_WEBHOOK")
	notionSecret := os.Getenv("NOTION_SECRET")
	dataBucketName := os.Getenv("BUCKET_NAME")
	publicPath := os.Getenv("PUBLIC_PATH")
	workspace := os.Getenv("ALGOLIA_WORKSPACE")
	key := os.Getenv("ALGOLIA_KEY")
	indexName := os.Getenv("ALGOLIA_INDEX")

	c := notion.NewClient(notionSecret)

	// TODO: Put this into a set of goroutines
	for _, message := range sqsEvent.Records {
		fmt.Printf("The message %s for event source %s = %s \n", message.MessageId, message.EventSource, message.Body)

		// Setup
		var body models.NewBuildHandlerSqsBody
		err := json.Unmarshal([]byte(message.Body), &body)
		if err != nil {
			log.Println("(handler): unmarshal", err)
			continue
		}
		build, err := services.FetchBuildFromS3(dataBucketName, body.BuildId)
		if err != nil {
			log.Println("(handler): fetch build from s3", body.BuildId, err)
			continue
		}

		// Post to discord
		embed := build.ToDiscordEmbed(body.BuildId, *body.SubclassCode, dataBucketName, publicPath)
		embeds := []models.DiscordEmbed{
			embed,
		}
		err = services.PostToDiscord(webhookUrl, embeds)
		if err != nil {
			log.Println("(handler): post to discord", body.BuildId, err)
			continue
		}

		// Send to algolia
		dbBuild := build.ToDbRecord(body.BuildId, body.PublishedOn, body.MembershipId)
		algoliaRecord := build.ToAlgoliaRecord(body.BuildId, dbBuild)
		err = services.PostToAlgolia(workspace, key, indexName, algoliaRecord)
		if err != nil {
			log.Println("(handler): post to algolia", body.BuildId, err)
			continue
		}

		// Build to notion page
		createPageParams := buildToNotionPage(*build, body.BuildId, publicPath)
		_, err = c.CreatePage(context.Background(), createPageParams)
		if err != nil {
			log.Println("(handler): post to notion", body.BuildId, err)
			continue
		}
	}

	return nil
}

func buildToNotionPage(build models.Build, buildId string, publicPath string) notion.CreatePageParams {
	notionDbId := os.Getenv("NOTION_DB_ID")

	// 88 chars total for the URL & tags, 3 new lines added for safety, 3 for "...", 2 for extra quotes, 3 for "qa.""
	notesMaxLength := 270 - 99 - len(build.Name)

	// Calculate the length of the title
	content := build.Name + "\n\n"
	if build.Notes != "" && len(build.Notes) > notesMaxLength {
		if len(build.Notes) > notesMaxLength {
			content += "\"" + build.Notes[0:notesMaxLength] + "...\""
		} else {
			content += "\"" + build.Notes + "\""
		}
		content += "\n\n"
	}
	content += fmt.Sprintf("%v/build/%v", publicPath, buildId) + "\n\n#destiny #destiny2"

	// Title should be {NAME}\n {notes ? NOTES_SUMMARY}\n {URL} \n {TAGS}
	title := notion.RichText{
		Text: &notion.Text{
			Content: content,
		},
	}

	return notion.CreatePageParams{
		ParentType: "database_id",
		ParentID:   notionDbId,
		DatabasePageProperties: &notion.DatabasePageProperties{
			"Name": notion.DatabasePageProperty{
				Title: []notion.RichText{
					title,
				},
			},
		},
	}
}
