package main

import (
	"bytes"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"
)

func main() {
	args := os.Args[1:]

	log.Println(args[3])

	stackName := args[0]
	artifactsBucket := args[1]
	region := args[2]
	params := args[3]

	samArgs := []string{
		"deploy",
		"--stack-name",
		stackName,
		"--s3-bucket",
		artifactsBucket,
		"--region",
		region,
		"no-confirm-changeset",
		"--capabilities",
		"CAPABILITY_IAM",
		"--parameter-overrides",
	}

	splitParams := strings.Split(params, " ")
	for _, el := range splitParams {
		samArgs = append(samArgs, el)
	}

	if len(args) > 4 {
		samArgs = append(samArgs, "--profile")
		samArgs = append(samArgs, args[4])
	}

	var errBuf bytes.Buffer
	cmd := exec.Command("sam", samArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = io.MultiWriter(os.Stderr, &errBuf)
	err := cmd.Run()

	if err != nil {
		errString := string(errBuf.Bytes())
		if strings.Contains(errString, "Error: No changes to deploy.") {
			return
		}
		log.Fatal(err.Error())
	}
}
