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
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/fogleman/gg"
	"guardianforge.net/core/models"
)

//go:embed img/bg-wq.png
var bgbytes []byte

func handler(ctx context.Context, s3Event events.S3Event) {
	for _, record := range s3Event.Records {
		s3 := record.S3
		log.Println(fmt.Sprintf("(handler) Handling build %v", s3.Object.Key))
		createImage(s3.Bucket.Name, s3.Object.Key)
		fmt.Printf("[%s - %s] Bucket = %s, Key = %s \n", record.EventSource, record.EventTime, s3.Bucket.Name, s3.Object.Key)
	}
}

func main() {
	lambda.Start(handler)
}

func createImage(bucketName string, key string) error {
	// https://guardianforge-qa-builds.s3.amazonaws.com/builds/02bf1dd9-da92-4f66-a2f7-06ae3bf0fd2f.json
	res, err := http.Get(fmt.Sprintf("https://%v.s3.amazonaws.com/%v", bucketName, key))
	if err != nil {
		log.Panic(err)
	}
	defer res.Body.Close()

	var build models.Build
	err = json.NewDecoder(res.Body).Decode(&build)
	if err != nil {
		log.Panic(err)
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
			log.Panic(err)
		}

		if url == "" {
			continue
		}

		imgUrls[url] = true

		res, err := http.Get(url)
		if err != nil {
			log.Panic(err)
		}
		defer res.Body.Close()

		img, _, err := image.Decode(res.Body)
		if err != nil {
			log.Panic(err)
		}

		x := xBase
		y := yBase
		if col != 1 {
			x += ((96 + xPadding) * (col - 1))
		}

		if row != 1 {
			y += ((96 + yPadding) * (row - 1))
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
		url, isStat := getUrlForItemIndex(build, count)
		if url == "" || imgUrls[url] {
			continue
		}

		imgUrls[url] = true

		res, err := http.Get(url)
		if err != nil {
			log.Panic(err)
		}
		defer res.Body.Close()

		img, _, err := image.Decode(res.Body)
		if err != nil {
			log.Panic(err)
		}

		x := xBase
		y := yBase
		if col != 1 {
			x += ((96 + xPadding) * (col - 1))
		}

		if row != 1 {
			y += ((96 + yPadding) * (row - 1))
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
		log.Panic("png.Decode", err)
		return err
	}

	dc.DrawImage(bg, 0, 0)

	b := bytes.Buffer{}
	err = png.Encode(&b, dc.Image())
	if err != nil {
		log.Panic("png.Encode", err)
		return err
	}

	splitKey := strings.Split(key, "/")
	buildId := strings.ReplaceAll(splitKey[1], ".json", "")

	acl := "public-read"
	ogImageKey := fmt.Sprintf("og/%v.png", buildId)
	sess, err := session.NewSession()

	if err != nil {
		log.Panic("create session", err)
		return err
	}

	reader := bytes.NewReader(b.Bytes())

	var contentType string = "image/png"

	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket:      &bucketName,
		Key:         &ogImageKey,
		Body:        reader,
		ACL:         &acl,
		ContentType: &contentType,
	})

	if err != nil {
		log.Panic("putBuildToS3", err)
		return err
	}
	return nil
}

func getUrlForItemIndex(build models.Build, index int) (string, bool) {
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
		return build.Stats.Mobility.IconUrl, true
	}

	if index == 9 {
		// Energy
		return build.Stats.Resilience.IconUrl, true
	}

	if index == 10 {
		// Energy
		return build.Stats.Recovery.IconUrl, true
	}

	if index == 11 {
		// Energy
		return build.Stats.Discipline.IconUrl, true
	}

	if index == 12 {
		// Energy
		return build.Stats.Intellect.IconUrl, true
	}

	if index == 13 {
		// Energy
		return build.Stats.Strength.IconUrl, true
	}

	return "", false
}
