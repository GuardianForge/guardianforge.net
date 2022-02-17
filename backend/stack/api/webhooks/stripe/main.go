package main

import (
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/pkg/errors"
	"guardianforge.net/core/db/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"

	"github.com/stripe/stripe-go/webhook"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	event, err := webhook.ConstructEvent([]byte(request.Body), request.Headers["Stripe-Signature"], endpointSecret)

	if err != nil {
		return utils.ErrorResponse(err, "(handler) ConstructEvent")
	}

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	// case "customer.subscription.created":
	// 	// Add subscription id to user object in the database
	// 	subscriptionId := event.Data.Object["id"].(string)
	// 	metadata := event.Data.Object["metadata"].(map[string]string)
	// 	membershipId := metadata["Bungie Membership Id"]
	// 	err = addSubscriptionToUser(membershipId, subscriptionId)
	// 	if err != nil {
	// 		return utils.ErrorResponse(err, "(handler) Type switch (customer.subscription.created)")
	// 	}
	case "customer.subscription.updated":
		subscriptionId := event.Data.Object["id"].(string)
		metadata := event.Data.Object["metadata"].(map[string]interface{})
		membershipId := metadata["Bungie Membership Id"].(string)
		status := event.Data.Object["status"].(string)
		start := event.Data.Object["current_period_start"].(float64)
		end := event.Data.Object["current_period_end"].(float64)
		if status == "active" {
			err = addSubscriptionToUser(membershipId, subscriptionId, start, end)
		} else {
			err = removeSubscriptionFromUser(membershipId)
		}
		if err != nil {
			return utils.ErrorResponse(err, "(handler) Type switch (customer.subscription.updated)")
		}
	case "customer.subscription.deleted":
		metadata := event.Data.Object["metadata"].(map[string]interface{})
		membershipId := metadata["Bungie Membership Id"].(string)
		err = removeSubscriptionFromUser(membershipId)
		if err != nil {
			return utils.ErrorResponse(err, "(handler) Type switch (customer.subscription.deleted)")
		}
	default:
		// TODO: Unhandled event type, log it & ignore
		break
	}

	return utils.OkResponse(nil)
}

func addSubscriptionToUser(membershipId string, subscriptionId string, startDate float64, endDate float64) error {
	userData, err := services.GetUserInfo(membershipId)
	if err != nil {
		return errors.Wrap(err, "(addSubscriptionToUser) services.GetUserInfo")
	}

	userData.SubscriptionDetails = &models.SubscriptionDetails{
		SubscriptionId: &subscriptionId,
		StartDate:      &startDate,
		EndDate:        &endDate,
	}
	record, err := models.MakeUserRecord(membershipId)
	if err != nil {
		return errors.Wrap(err, "(addSubscriptionToUser) models.MakeUserRecord")
	}

	record.Data = *userData
	err = services.UpdateUserInfo(*record)
	if err != nil {
		return errors.Wrap(err, "(addSubscriptionToUser) services.UpdateUserInfo")
	}

	return nil
}

func removeSubscriptionFromUser(membershipId string) error {
	userData, err := services.GetUserInfo(membershipId)
	if err != nil {
		return errors.Wrap(err, "(removeSubscriptionFromUser) services.GetUserInfo")
	}

	userData.SubscriptionDetails = nil
	record, err := models.MakeUserRecord(membershipId)
	if err != nil {
		return errors.Wrap(err, "(removeSubscriptionFromUser) models.MakeUserRecord")
	}

	record.Data = *userData
	err = services.UpdateUserInfo(*record)
	if err != nil {
		return errors.Wrap(err, "(removeSubscriptionFromUser) services.UpdateUserInfo")
	}

	return nil
}
