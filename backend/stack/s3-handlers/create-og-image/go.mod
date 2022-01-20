module guardianforge.net/fns/create-og-image

go 1.16

require (
	github.com/aws/aws-lambda-go v1.25.0
	github.com/aws/aws-sdk-go v1.39.5
	github.com/fogleman/gg v1.3.0
	github.com/golang/freetype v0.0.0-20170609003504-e2365dfdc4a0 // indirect
	golang.org/x/image v0.0.0-20210628002857-a66eb6448b8d // indirect
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

replace guardianforge.net/core => ../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../bunGOnet
