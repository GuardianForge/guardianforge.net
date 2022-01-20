package db

import (
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/pkg/errors"
)

type DbContext struct {
	DynamoSvc *dynamodb.DynamoDB
	Session   *session.Session
	TableName *string
}

func MakeContext(sess *session.Session, tableName *string) (*DbContext, error) {
	var _session *session.Session
	if sess == nil {
		sess, err := session.NewSession()
		if err != nil {
			return nil, errors.Wrap(err, "(MakeContext) creating session")
		}
		_session = sess
	} else {
		_session = sess
	}

	svc := dynamodb.New(_session)

	context := DbContext{
		DynamoSvc: svc,
		Session:   _session,
	}

	if tableName != nil {
		context.TableName = tableName
	}
	return &context, nil
}
