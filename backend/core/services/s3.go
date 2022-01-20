package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/pkg/errors"
	"guardianforge.net/core/models"
)

func FetchBuildFromS3(bucketName string, buildId string) (*models.Build, error) {
	url := fmt.Sprintf("https://%v.s3.amazonaws.com/builds/%v.json", bucketName, buildId)
	res, err := http.Get(url)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf("(FetchBuildFromS3) Calling URL: %v", url))
	}
	defer res.Body.Close()

	var build models.Build
	err = json.NewDecoder(res.Body).Decode(&build)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchBuildFromS3) Decoding build")
	}

	return &build, nil
}

func PutBuildToS3(bucketName string, buildId string, buildData models.Build) error {
	acl := "public-read"
	key := fmt.Sprintf("builds/%v.json", buildId)
	sess, err := session.NewSession()
	if err != nil {
		return errors.Wrap(err, "(PutBuildToS3) Creating AWS session")
	}

	buildBytes, err := json.Marshal(buildData)
	if err != nil {
		return errors.Wrap(err, "(PutBuildToS3) Marshal build data")
	}

	body := bytes.NewBuffer(buildBytes)

	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket: &bucketName,
		Key:    &key,
		Body:   body,
		ACL:    &acl,
	})
	if err != nil {
		return errors.Wrap(err, "(PutBuildToS3) Uploading build")
	}

	return nil
}
