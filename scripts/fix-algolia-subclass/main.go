package main

import (
	"encoding/csv"
	"log"
	"os"
	"strconv"
	"strings"

	"guardianforge.net/core/services"
)

type BuildCsvRow struct {
	BuildId  string
	Subclass int
}

func main() {
	workspace := os.Getenv("ALGOLIA_WORKSPACE")
	key := os.Getenv("ALGOLIA_KEY")
	indexName := os.Getenv("ALGOLIA_INDEX")

	builds := []BuildCsvRow{}

	// Import CSV file
	f, err := os.Open("results.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}
	for idx, el := range records {
		if idx == 0 {
			continue
		}
		if len(el) < 6 {
			log.Println("skipping row", idx)
		}
		buildId := el[1]
		searchKey := el[5]
		subclass := 0
		searchKeySplit := strings.Split(searchKey, "_")
		if len(searchKeySplit) > 1 {
			subclass, err = strconv.Atoi(searchKeySplit[1])
			if err != nil {
				log.Fatal(err)
			}
		} else {
			log.Println("skipping", buildId, searchKey, searchKeySplit)
			continue
		}

		builds = append(builds, BuildCsvRow{
			BuildId:  buildId,
			Subclass: subclass,
		})
	}

	// foreach, pull data from algolia, update subclass
	iterator := 0
	buildsUpdated := []string{}
	for _, el := range builds {
		if iterator > 5 {
			continue
		}

		log.Println("Processing", el.BuildId, el.Subclass)

		algoliaObj, err := services.GetRecordFromAlgolia(workspace, key, indexName, el.BuildId)
		if err != nil {
			log.Println("(handler) failed to get record from algolia", el.BuildId, err)
			continue
		}

		if algoliaObj.Subclass != 0 {
			log.Println("Build is good, skipping...")
			continue
		}

		algoliaObj.Subclass = el.Subclass

		err = services.PostToAlgolia(workspace, key, indexName, *algoliaObj)
		if err != nil {
			log.Println("(handler) post to algolia", el.BuildId, err)
			iterator++
		} else {
			buildsUpdated = append(buildsUpdated, el.BuildId)
		}
	}
	log.Println(len(buildsUpdated), " updated")
	log.Println(buildsUpdated)
}
