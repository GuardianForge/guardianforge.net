import { MouseEventHandler } from "react"

export type AlertDetailButton = {
  title: string
  fn: MouseEventHandler
}

class AlertDetail{
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