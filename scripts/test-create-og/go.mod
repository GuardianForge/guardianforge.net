module test-create-og

replace guardianforge.net/core => ../../backend/core

replace github.com/bmorrisondev/bunGOnet => ../../backend/bunGOnet

go 1.17

require (
	github.com/fogleman/gg v1.3.0
	guardianforge.net/core v0.0.0-00010101000000-000000000000
)

require (
	github.com/golang/freetype v0.0.0-20170609003504-e2365dfdc4a0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	golang.org/x/image v0.0.0-20211028202545-6944b10bf410 // indirect
)
