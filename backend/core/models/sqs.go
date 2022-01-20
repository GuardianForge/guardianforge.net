package models

type UpvoteBuildsSqsModel struct {
	BuildId        string `json:"buildId"`
	IsDecrementing bool   `json:"isDecrementing"`
}

type NewBuildHandlerSqsBody struct {
	BuildId      string  `json:"buildId"`
	SubclassCode *string `json:"subclassCode,omitempty"`
	PublishedOn  int64   `json::"publishedOn"`
	MembershipId *string `json:"membershipId,omitempty"`
}
