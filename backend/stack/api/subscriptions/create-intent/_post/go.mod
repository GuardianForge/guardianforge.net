module guardianforge.net/api/subscriptions/create-intent/_post

go 1.16

require (
	github.com/aws/aws-lambda-go v1.28.0
	github.com/stripe/stripe-go/v72 v72.86.0
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

replace guardianforge.net/core => ../../../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../../../bunGOnet
