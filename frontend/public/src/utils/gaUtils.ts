export function init(id: string) {
  try {
    let gaScript = document.createElement('script')
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    gaScript.async = true
    document.head.appendChild(gaScript)

    const dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments);
    }
    window.gtag('js', new Date());
    window.gtag('config', id);
  } catch(err) {
    console.warn("(gaUtils.init)", err)
  }
}