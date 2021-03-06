// main.go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"log"
	"net/http"
	"strings"

	_ "embed"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/fogleman/gg"
	"github.com/pkg/errors"
	"guardianforge.net/core/models"
)

//go:embed img/bg-wq.png
var bgbytes []byte

//go:embed img/stats/dis.png
var disbytes []byte

//go:embed img/stats/int.png
var intbytes []byte

//go:embed img/stats/mob.png
var mobbytes []byte

//go:embed img/stats/rec.png
var recbytes []byte

//go:embed img/stats/res.png
var resbytes []byte

//go:embed img/stats/str.png
var strbytes []byte

func main() {
	lambda.Start(handler)
}

func handler(ctx context.Context, s3Event events.S3Event) {
	for _, record := range s3Event.Records {
		s3 := record.S3
		log.Println(fmt.Sprintf("(handler) Handling build %v", s3.Object.Key))
		CreateImage(s3.Bucket.Name, s3.Object.Key)
		fmt.Printf("[%s - %s] Bucket = %s, Key = %s \n", record.EventSource, record.EventTime, s3.Bucket.Name, s3.Object.Key)
	}
}

func CreateImage(bucketName string, key string) error {
	// https://guardianforge-qa-builds.s3.amazonaws.com/builds/02bf1dd9-da92-4f66-a2f7-06ae3bf0fd2f.json
	res, err := http.Get(fmt.Sprintf("https://%v.s3.amazonaws.com/%v", bucketName, key))
	if err != nil {
		return errors.Wrap(err, "(CreateImage) http.Get")
	}
	defer res.Body.Close()

	var build models.Build
	err = json.NewDecoder(res.Body).Decode(&build)
	if err != nil {
		return errors.Wrap(err, "(CreateImage) json.NewDecoder for json body")
	}

	dc := gg.NewContext(500, 500)
	dc.SetHexColor("#1e1f24")
	dc.Clear()

	xPadding := 18
	yPadding := 24
	xBase := 31
	yBase := 23

	row := 1
	col := 1
	count := 0
	imgUrls := map[string]bool{}
	for _, h := range build.Highlights {
		count++
		url, err := build.GetHighlightIconUrl(h)
		if err != nil {
			return errors.Wrap(err, "(CreateImage) build.GetHighlightIconUrl")
		}

		if url == "" {
			continue
		}

		imgUrls[url] = true

		x := xBase
		y := yBase
		if col != 1 {
			x += ((96 + xPadding) * (col - 1))
		}

		if row != 1 {
			y += ((96 + yPadding) * (row - 1))
		}

		img, err := FetchImage(url)
		if err != nil {
			return errors.Wrap(err, "(CreateImage) FetchImage")
		}

		if strings.Contains(h, "stat") {
			dc.DrawImageAnchored(img, x+48, y+48, 0.5, 0.5)
		} else {
			dc.DrawImage(img, x, y)
		}

		if col == 4 {
			col = 1
			row++
		} else {
			col++
		}
	}

	for i := 0; count < 12 && i < 20; i++ {
		url, isStat := GetUrlForItemIndex(build, count)
		if url == "" || imgUrls[url] {
			continue
		}

		imgUrls[url] = true

		x := xBase
		y := yBase
		if col != 1 {
			x += ((96 + xPadding) * (col - 1))
		}

		if row != 1 {
			y += ((96 + yPadding) * (row - 1))
		}

		img, err := GenerateImageBlock(url, isStat)
		if err != nil {
			return errors.Wrap(err, "(CreateImage) GenerateImageBlock")
		}

		if isStat {
			dc.DrawImageAnchored(img, x+48, y+48, 0.5, 0.5)
		} else {
			dc.DrawImage(img, x, y)
		}

		if col == 4 {
			col = 1
			row++
		} else {
			col++
		}
		count++
	}

	fbg := bytes.NewReader(bgbytes)

	bg, err := png.Decode(fbg)
	if err != nil {
		return errors.Wrap(err, "(CreateImage) png.Decode background")
	}

	dc.DrawImage(bg, 0, 0)

	b := bytes.Buffer{}
	err = png.Encode(&b, dc.Image())
	if err != nil {
		return errors.Wrap(err, "(CreateImage) png.Encode")
	}

	splitKey := strings.Split(key, "/")
	buildId := strings.ReplaceAll(splitKey[1], ".json", "")
	err = WriteImageToS3(bucketName, buildId, b)

	return nil
}

func WriteImageToS3(bucketName string, buildId string, imageBytesBuffer bytes.Buffer) error {
	ogImageKey := fmt.Sprintf("og/%v.png", buildId)
	sess, err := session.NewSession()
	if err != nil {
		return errors.Wrap(err, "(WriteImageToS3) create session")
	}

	reader := bytes.NewReader(imageBytesBuffer.Bytes())
	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket:      &bucketName,
		Key:         &ogImageKey,
		Body:        reader,
		ACL:         aws.String("public-read"),
		ContentType: aws.String("image/png"),
	})
	if err != nil {
		return errors.Wrap(err, "(WriteImageToS3) create session")
	}
	return nil
}
func FetchImage(url string) (image.Image, error) {
	res, err := http.Get(url)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchImage) http.Get")
	}
	defer res.Body.Close()

	img, _, err := image.Decode(res.Body)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchImage) image.Decode")
	}
	return img, nil
}

func GenerateImageBlock(url string, isStat bool) (image.Image, error) {
	if isStat {
		var imgReader *bytes.Reader
		switch url {
		case "Resilience":
			imgReader = bytes.NewReader(resbytes)
		case "Mobility":
			imgReader = bytes.NewReader(mobbytes)
		case "Recovery":
			imgReader = bytes.NewReader(recbytes)
		case "Discipline":
			imgReader = bytes.NewReader(disbytes)
		case "Intellect":
			imgReader = bytes.NewReader(intbytes)
		case "Strength":
			imgReader = bytes.NewReader(strbytes)
		}

		img, err := png.Decode(imgReader)
		if err != nil {
			return nil, errors.Wrap(err, "(GenerateImageBlock) png.Decode")
		}
		return img, nil
	} else {
		return FetchImage(url)
	}
}

func GetUrlForItemIndex(build models.Build, index int) (string, bool) {
	if index == 0 {
		// Kinetic
		return build.Items.Kinetic.IconURL, false
	}

	if index == 1 {
		// Energy
		return build.Items.Energy.IconURL, false
	}

	if index == 2 {
		// Energy
		return build.Items.Power.IconURL, false
	}

	if index == 3 {
		// Energy
		return build.Items.Helmet.IconURL, false
	}

	if index == 4 {
		// Energy
		return build.Items.Arms.IconURL, false
	}

	if index == 5 {
		// Energy
		return build.Items.Chest.IconURL, false
	}

	if index == 6 {
		// Energy
		return build.Items.Legs.IconURL, false
	}

	if index == 7 {
		// Energy
		return build.Items.ClassItem.IconURL, false
	}

	if index == 8 {
		// Energy
		return "Mobility", true
	}

	if index == 9 {
		// Energy
		return "Resilience", true
	}

	if index == 10 {
		// Energy
		return "Recovery", true
	}

	if index == 11 {
		// Energy
		return "Discipline", true
	}

	if index == 12 {
		// Energy
		return "Intellect", true
	}

	if index == 13 {
		// Energy
		return "Strength", true
	}

	return "", false
}
