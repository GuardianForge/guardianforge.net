export class BungieAuthService {
  _clientId: string
  _apiKey: string
  _loginUrl: string
  _refreshUrl: string

  constructor(clientId: string, apiKey: string) {
    this._clientId = clientId
    this._apiKey = apiKey

    this._loginUrl = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code`
    this._refreshUrl = `https://www.bungie.net/platform/app/oauth/token`
  }

  async refreshAccessToken(refreshToken: string) {
    let res = await fetch(this._refreshUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Api-Key": this._apiKey
      },
      body: `client_id=${this._clientId}&grant_type=refresh_token&refresh_token=${refreshToken}`
    })
    return await res.json()
  }

  async redirectToLogin() {
    let { pathname } = window.location
    // @ts-ignore
    window.location = `${this._loginUrl}#state=${pathname}`
  }
}
