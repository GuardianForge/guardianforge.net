package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"guardianforge.net/core/models"
	"guardianforge.net/core/services"
)

func main() {
	lambda.Start(handler)
}

func handler(ctx context.Context, sqsEvent events.SQSEvent) error {
	workspace := os.Getenv("ALGOLIA_WORKSPACE")
	key := os.Getenv("ALGOLIA_KEY")
	indexName := os.Getenv("ALGOLIA_INDEX")

	for _, message := range sqsEvent.Records {
		fmt.Printf("The message %s for event source %s = %s \n", message.MessageId, message.EventSource, message.Body)

		var msg models.UpvoteBuildsSqsModel
		err := json.Unmarshal([]byte(message.Body), &msg)
		if err != nil {
			log.Println("(handler) failed to unmarshal body", err)
			continue
		}

		log.Println("msg", msg)

		algoliaObj, err := services.GetRecordFromAlgolia(workspace, key, indexName, msg.BuildId)
		if err != nil {
			log.Println("(handler) failed to get record from algolia", msg.BuildId, err)
			continue
		}

		log.Println("algoliaObj before", *algoliaObj.Summary.Upvotes)

		upvotes := 0
		if algoliaObj.Summary.Upvotes != nil {
			upvotes = *algoliaObj.Summary.Upvotes
		}

		if upvotes == 0 && msg.IsDecrementing {
			log.Println("(handler) attempted to decrement 0 upvotes, continuing", msg.BuildId)
			continue
		}

		if msg.IsDecrementing {
			upvotes--
		} else {
			upvotes++
		}

		algoliaObj.Summary.Upvotes = &upvotes

		log.Println("upvotes", upvotes)
		log.Println("algoliaObj after", *algoliaObj.Summary.Upvotes)

		err = services.PostToAlgolia(workspace, key, indexName, *algoliaObj)
		if err != nil {
			log.Println("(handler) post to algolia", msg.BuildId, err)
		}
	}

	return nil
}
