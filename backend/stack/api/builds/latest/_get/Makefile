
build-FetchLatestBuildsFn:
	# go mod vendor
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap
	cp ./bootstrap $(ARTIFACTS_DIR)/.