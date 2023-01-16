exports.dispatch = (detail) => {
  window.dispatchEvent(new CustomEvent("gf_alerts", {
    detail
  }))
}