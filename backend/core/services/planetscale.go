package services

import (
	"database/sql"
	"encoding/json"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/pkg/errors"
	dbModels "guardianforge.net/core/db/models"
)

var psdb *sql.DB

func connect() error {
	_psdb, err := sql.Open("mysql", os.Getenv("PS_CONN_STR"))
	if err == nil {
		psdb = _psdb
	}
	return err
}

func CreateBuild(buildRecord dbModels.Build) error {
	err := connect()
	if err != nil {
		return errors.Wrap(err, "(CreateBuild) connect")
	}

	psbuild := buildRecord.ToPSBuild()

	query := `INSERT INTO Builds(Id,
		PublishedOn,
		CreatedById,
		Upvotes,
		SeasonalUpvotes,
		UserId,
		Username,
		Highlights,
		Name,
		PrimaryIconSet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	stmt, err := psdb.Prepare(query)
	if err != nil {
		return errors.Wrap(err, "(CreateBuild) Prepare")
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		psbuild.Id,
		psbuild.PublishedOn,
		psbuild.CreatedById,
		psbuild.Upvotes,
		psbuild.SeasonalUpvotes,
		psbuild.UserId,
		psbuild.Username,
		psbuild.Highlights,
		psbuild.Name,
		psbuild.PrimaryIconSet,
	)
	if err != nil {
		return errors.Wrap(err, "(CreateBuild) Exec")
	}
	return nil
}

func UpdateBuild(buildId string, buildRecord dbModels.Build) error {
	err := connect()
	if err != nil {
		return errors.Wrap(err, "(UpdateBuild) connect")
	}

	psbuild := buildRecord.ToPSBuild()

	query := `UPDATE Builds SET Name = ? WHERE Id = ?`
	stmt, err := psdb.Prepare(query)
	if err != nil {
		return errors.Wrap(err, "(UpdateBuild) Prepare")
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		psbuild.Name,
		buildId,
	)
	if err != nil {
		return errors.Wrap(err, "(UpdateBuild) Exec")
	}
	return nil
}

func PSFetchBuildById(buildId string) (*dbModels.Build, error) {
	err := connect()
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchBuildById) connect")
	}

	query := "SELECT * FROM Builds WHERE Id = ? LIMIT 1"
	stmt, err := psdb.Prepare(query)
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchBuildById) Prepare")
	}
	defer stmt.Close()

	build := dbModels.Build{
		Summary: dbModels.BuildSummary{},
	}

	var isPrivate *bool
	var seasonalUpvotesString string
	var highlightsString string

	err = stmt.QueryRow(buildId).Scan(
		&build.Id,
		&build.PublishedOn,
		&build.CreatedById,
		&isPrivate,
		&build.Upvotes,
		&seasonalUpvotesString,
		&build.Summary.UserId,
		&build.Summary.Username,
		&highlightsString,
		&build.Summary.Name,
		&build.Summary.PrimaryIconSet,
	)
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchBuildById) execQuery")
	}

	if isPrivate != nil && *isPrivate == true {
		build.IsPrivate = true
	}

	if seasonalUpvotesString != "" {
		err = json.Unmarshal([]byte(seasonalUpvotesString), &build.Summary.Highlights)
		if err != nil {
			return nil, errors.Wrap(err, "(PSFetchBuildId) unmarshal seasonal upvotes")
		}
	}

	if highlightsString != "" {
		err = json.Unmarshal([]byte(highlightsString), &build.Summary.Highlights)
		if err != nil {
			return nil, errors.Wrap(err, "(PSFetchBuildId) unmarshal highlights")
		}
	}

	return &build, err
}

func DeleteBuild(buildId string) error {
	err := connect()
	if err != nil {
		return errors.Wrap(err, "(DeleteBuild) connect")
	}

	query := `DELETE FROM Builds WHERE Id = ?`
	stmt, err := psdb.Prepare(query)
	if err != nil {
		return errors.Wrap(err, "(DeleteBuild) Prepare")
	}
	defer stmt.Close()

	_, err = stmt.Exec(buildId)
	if err != nil {
		return errors.Wrap(err, "(DeleteBuild) Exec")
	}
	return nil
}

func PSFetchLatestBuilds() ([]dbModels.BuildSummary, error) {
	err := connect()
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchLatestBuilds) connect")
	}

	query := "SELECT * FROM Builds ORDER BY PublishedOn DESC LIMIT 15"
	stmt, err := psdb.Prepare(query)
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchLatestBuilds) Prepare")
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		return nil, errors.Wrap(err, "(PSFetchLatestBuilds) query")
	}
	defer rows.Close()

	summaries := []dbModels.BuildSummary{}

	for rows.Next() {
		build := dbModels.Build{
			Summary: dbModels.BuildSummary{},
		}
		var isPrivate *bool
		var seasonalUpvotesString string
		var highlightsString string

		err = rows.Scan(
			&build.Id,
			&build.PublishedOn,
			&build.CreatedById,
			&isPrivate,
			&build.Upvotes,
			&seasonalUpvotesString,
			&build.Summary.UserId,
			&build.Summary.Username,
			&highlightsString,
			&build.Summary.Name,
			&build.Summary.PrimaryIconSet,
		)

		if isPrivate != nil && *isPrivate == true {
			build.IsPrivate = true
		}

		if seasonalUpvotesString != "" {
			err = json.Unmarshal([]byte(seasonalUpvotesString), &build.Summary.Highlights)
			if err != nil {
				return nil, errors.Wrap(err, "(PSFetchLatestBuilds) unmarshal seasonal upvotes")
			}
		}

		if highlightsString != "" {
			err = json.Unmarshal([]byte(highlightsString), &build.Summary.Highlights)
			if err != nil {
				return nil, errors.Wrap(err, "(PSFetchLatestBuilds) unmarshal highlights")
			}
		}
		summaries = append(summaries, build.Summary)
	}

	return summaries, err
}
