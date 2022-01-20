package services

import (
	"fmt"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/search"
	"github.com/pkg/errors"
	"guardianforge.net/core/models"
)

func GetRecordFromAlgolia(workspace string, key string, indexName string, objectId string) (*models.AlgoliaBuildRecord, error) {
	client := search.NewClient(workspace, key)
	index := client.InitIndex(indexName)

	var obj models.AlgoliaBuildRecord
	err := index.GetObject(objectId, &obj)
	if err != nil {
		msg := fmt.Sprintf("(GetRecordFromAlgolia) Failed to get object: %v", err.Error())
		return nil, errors.Wrap(err, msg)
	}
	return &obj, nil
}

func PostToAlgolia(workspace string, key string, indexName string, object models.AlgoliaBuildRecord) error {
	client := search.NewClient(workspace, key)
	index := client.InitIndex(indexName)

	_, err := index.SaveObject(object)
	if err != nil {
		msg := fmt.Sprintf("(PostToAlgolia) Failed to save object: %v", err.Error())
		return errors.Wrap(err, msg)
	}
	return nil
}

func DeleteItemFromAlgolia(workspace string, key string, indexName string, objectId string) error {
	client := search.NewClient(workspace, key)
	index := client.InitIndex(indexName)

	_, err := index.DeleteObject(objectId)
	if err != nil {
		msg := fmt.Sprintf("(DeleteItemFromAlgolia) Failed to delete object: %v", err.Error())
		return errors.Wrap(err, msg)
	}
	return nil
}
