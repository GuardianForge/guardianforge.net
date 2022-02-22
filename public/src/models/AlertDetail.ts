import { MouseEventHandler } from "react"
import { Alert } from "react-bootstrap"

export type AlertDetailButton = {
  title: string
  fn: MouseEventHandler
}

class AlertDetail {
  id: number
  body: string
  title?: string
  isError?: boolean
  autohide?: boolean
  buttons?: Array<AlertDetailButton>

  constructor(body: string, title?: string, isError?: boolean, autohide?: boolean) {
    this.id = Date.now()
    this.body = body
    if(!title) title = "Alert"
    this.title = title
    this.isError = isError
    this.autohide = autohide


    // TODO: Get this working properly
    // if(detail.isError) {
    //   detail.buttons = [
    //     {
    //       title: "Report",
    //       fn: () => reportError(detail)
    //     }
    //   ]
    // }
  }
}
export default AlertDetail

export const BungieOfflineAlert = new AlertDetail(
  "An error occurred while accessing Bungie's API. The system may be offline. Please try again later...",
  "Bungie API",
  true,
  false
)
