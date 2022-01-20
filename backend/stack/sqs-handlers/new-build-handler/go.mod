module guardianforge.net/fns/sqs-handlers/new-build-handler

go 1.16

replace guardianforge.net/core => ../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../bunGOnet

require (
	github.com/aws/aws-lambda-go v1.27.0
	github.com/dstotijn/go-notion v0.4.0 // indirect
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)
