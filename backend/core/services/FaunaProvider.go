package services

import (
	"encoding/json"
	"fmt"
	"log"

	f "github.com/fauna/faunadb-go/v4/faunadb"
	"github.com/pkg/errors"
	dbModels "guardianforge.net/core/db/models"
)

type FaunaProvider struct {
	Client *f.FaunaClient
}

func NewFaunaProvider(secret string, endpoint string) FaunaProvider {
	return FaunaProvider{
		Client: f.NewFaunaClient(secret, f.Endpoint(endpoint), f.QueryTimeoutMS(2000)),
	}
}

func (fp *FaunaProvider) PutBuild(buildRecord dbModels.Build) error {
	_, err := fp.Client.Query(
		f.If(
			f.Exists(f.MatchTerm(f.Index("builds_byBuildId3"), buildRecord.Id)),
			f.Update(
				f.Select("ref", f.Get(f.MatchTerm(f.Index("builds_byBuildId3"), buildRecord.Id))),
				f.Obj{
					"data": buildRecord,
				},
			),
			f.Create(
				f.Collection("builds"),
				f.Obj{
					"data": buildRecord,
				},
			),
		),
		// f.Create(
		// 	f.Collection("builds"),
		// 	f.Obj{
		// 		"data": buildRecord,
		// 	},
		// ),
	)
	if err != nil {
		return errors.Wrap(err, "(FaunaProvider.PutBuild) Execute query")
	}
	return nil
}

func (fp *FaunaProvider) DeleteBuild(buildId string) error {
	log.Println("(FaunaProvider.DeleteBuild) start")
	_, err := fp.Client.Query(
		f.Delete(
			f.Select("ref", f.Get(f.MatchTerm(f.Index("builds_byBuildId3"), buildId))),
		),
	)
	if err != nil {
		return errors.Wrap(err, "(FaunaProvider.DeleteBuildFromDynamo) Execute query")
	}
	return nil
}

func (fp *FaunaProvider) FetchBuildById(buildId string) (*dbModels.Build, error) {
	log.Println("(FaunaProvider.FetchBuildById) start")
	result, err := fp.Client.Query(
		f.Get(
			f.MatchTerm(
				f.Index("builds_byBuildId3"),
				buildId,
			),
		),
	)
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchBuildById) Execute query")
	}

	var record FaunaBuildRecord
	err = result.Get(&record)
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchByBuildId) Get")
	}
	fmt.Println(record.Build)

	return &record.Build, nil
}

func (fp *FaunaProvider) FetchUserBuilds(membershipId string) (*[]dbModels.BuildSummary, error) {
	log.Println("(FaunaProvider.FetchUserBuilds) start")
	result, err := fp.Client.Query(
		f.Map(
			f.Paginate(
				f.MatchTerm(
					f.Index("builds_byCreatedById"),
					membershipId,
				),
			),
			f.Lambda(f.Arr{"ref"}, f.Get(f.Var("ref"))),
		),
	)
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) Execute query")
	}

	var records []FaunaBuildRecord
	err = result.At(f.ObjKey("data")).Get(&records)
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) result.Get")
	}

	summaries := []dbModels.BuildSummary{}
	for _, r := range records {
		s, err := r.Build.GetBuildSummary()
		if err != nil {
			return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) Get build summary")
		}
		summaries = append(summaries, *s)
	}
	return &summaries, nil
}

// func (fp *FaunaProvider) PutUserPrivateBuilds(membershipId string, privateBuilds map[string]dbModels.BuildSummary) error {

// }

// func (fp *FaunaProvider) FetchUserBookmarks(membershipId string) (*map[string]dbModels.BuildSummary, error) {

// }

// func (fp *FaunaProvider) FetchUserPrivateBuilds(membershipId string) (*map[string]dbModels.BuildSummary, error) {

// }

// func (fp *FaunaProvider) GetUserInfo(membershipId string) (*dbModels.UserRecordData, error) {

// }

// func (fp *FaunaProvider) UpdateUserInfo(record dbModels.UserRecord) error {

// }

// func (fp *FaunaProvider) FetchUserUpvotes(membershipId string) (*map[string]dbModels.BuildSummary, error) {

// }

type FaunaBuildRecord struct {
	Build dbModels.Build `fauna:"data"`
}

func (fp *FaunaProvider) FetchLatestBuilds() ([]dbModels.BuildSummary, error) {
	result, err := fp.Client.Query(
		f.Take(15, f.Map(
			f.Paginate(
				f.Match(
					f.Index("builds_orderBy_publishedOn_desc"),
				),
			),
			f.Lambda(f.Arr{"publishedOn", "ref"}, f.Get(f.Var("ref"))),
		),
		))
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) Execute query")
	}

	var records []FaunaBuildRecord
	err = result.At(f.ObjKey("data")).Get(&records)
	if err != nil {
		return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) result.Get")
	}

	summaries := []dbModels.BuildSummary{}
	for _, r := range records {
		s, err := r.Build.GetBuildSummary()
		if err != nil {
			return nil, errors.Wrap(err, "(FaunaProvider.FetchLatestBuilds) Get build summary")
		}
		summaries = append(summaries, *s)
	}
	jbytes, err := json.Marshal(summaries)
	if err != nil {
		return nil, errors.Wrap(err, "asdlfkjasldkjf")
	}
	str := string(jbytes)
	log.Println(str)
	return summaries, nil
}

// func (fp *FaunaProvider) UpdateBuildUpvoteCount(buildId string, isDecrementing bool) error {

// }

// func (fp *FaunaProvider) PutUserUpvotesToDynamo(membershipId string, upvotes map[string]dbModels.BuildSummary) error {

// }
