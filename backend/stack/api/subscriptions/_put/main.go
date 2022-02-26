package main

import (
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/client"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) validating request")
	}

	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	user, err := services.GetUserInfo(*membershipId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) GetUserInfo")
	}

	if user.SubscriptionDetails == nil {
		msg := "No active subscription found."
		return utils.BadRequestResponse(&msg)
	}

	// stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	sc := &client.API{}
	sc.Init(os.Getenv("STRIPE_SECRET_KEY"), nil)

	params := stripe.SubscriptionParams{
		CancelAtPeriodEnd: stripe.Bool(false),
	}
	_, err = sc.Subscriptions.Update(*user.SubscriptionDetails.SubscriptionId, &params)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) sub.Update")
	}

	return utils.OkResponse(nil)
}
