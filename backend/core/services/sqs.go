package services

import (
	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/pkg/errors"
)

func PostToSqs(queueUrl string, obj interface{}) error {
	j, err := json.Marshal(obj)
	if err != nil {
		return errors.Wrap(err, "(PostToSqs): marshal object")
	}

	sqsInput := sqs.SendMessageInput{
		DelaySeconds: aws.Int64(30),
		MessageBody:  aws.String(string(j)),
		QueueUrl:     aws.String(queueUrl),
	}

	sess, err := session.NewSession()
	if err != nil {
		return errors.Wrap(err, "(PostToSqs): create aws session")
	}

	sqsClient := sqs.New(sess, aws.NewConfig())
	_, err = sqsClient.SendMessage(&sqsInput)
	if err != nil {
		return errors.Wrap(err, "(PostToSqs): send sqs message")
	}
	return nil
}
