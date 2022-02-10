module guardianforge.net/api/admin/create-og-image/_post

go 1.16

require (
	github.com/aws/aws-lambda-go v1.25.0
	github.com/aws/aws-sdk-go v1.39.5
	github.com/fogleman/gg v1.3.0
	github.com/golang/freetype v0.0.0-20170609003504-e2365dfdc4a0 // indirect
	golang.org/x/image v0.0.0-20211028202545-6944b10bf410 // indirect
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

replace guardianforge.net/core => ../../../../../core

replace github.com/bmorrisondev/bunGOnet => ../../../../../bunGOnet
