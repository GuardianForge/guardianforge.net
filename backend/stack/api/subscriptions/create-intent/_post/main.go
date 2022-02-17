package main

import (
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
	"guardianforge.net/core/utils"
)

type RequestBody struct {
	PriceId *string `json:"priceId"`
}

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

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	successCallback := os.Getenv("STRIPE_SUCCESS_CALLBACK")
	errorCallback := os.Getenv("STRIPE_ERROR_CALLBACK")

	var body RequestBody
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal json")
	}

	checkoutParams := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			&stripe.CheckoutSessionLineItemParams{
				Price:    body.PriceId,
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(successCallback),
		CancelURL:  stripe.String(errorCallback),
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"Bungie Membership Id": *membershipId,
			},
		},
	}

	s, err := session.New(checkoutParams)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Create stripe session")
	}

	responseBody, err := utils.ConvertToJsonString(s)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Create stripe session")
	}

	return utils.OkResponse(&responseBody)
}
