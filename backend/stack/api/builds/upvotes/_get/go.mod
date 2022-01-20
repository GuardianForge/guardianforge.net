module guardianforge.net/api/builds/upvotes/_get

go 1.16

require (
	github.com/aws/aws-lambda-go v1.25.0
	github.com/aws/aws-sdk-go v1.39.5
	github.com/pkg/errors v0.9.1
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

replace guardianforge.net/core => ../../../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../../../bunGOnet
