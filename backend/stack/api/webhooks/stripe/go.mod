module guardianforge.net/api/webhooks/stripe

go 1.16

require (
	github.com/aws/aws-lambda-go v1.25.0
	github.com/pkg/errors v0.9.1
	github.com/stripe/stripe-go v70.15.0+incompatible
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

replace guardianforge.net/core => ../../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../../bunGOnet
