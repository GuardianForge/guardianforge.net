package models

type DiscordWebhookPostBody struct {
	Embeds []DiscordEmbed `json:"embeds"`
}

type DiscordEmbed struct {
	Title       *string      `json:"title"`
	Description *string      `json:"description"`
	Fields      []EmbedField `json:"fields"`
	Color       *int         `json:"color"`
	Thumbnail   *EmbedImage  `json:"thumbnail"`
	Image       *EmbedImage  `json:"image"`
	Url         *string      `json:"url"`
}

type EmbedImage struct {
	Url string `json:"url"`
}

type EmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}
