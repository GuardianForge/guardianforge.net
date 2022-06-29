/**
 * Seo component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from "react"
import { Helmet } from "react-helmet"

type Props = {
  location: any
  description?: string
  ogImageUrl?: string
  pageTitle?: string
}

const Seo = (props: Props) => {
  const { location, description, ogImageUrl, pageTitle } = props

  const siteName = "GuardianForge"
  const twitter = "@guardianforge"
  const origin = "https://guardianforge.net"
  const defaultDescription = "The best way to create and share Destiny 2 builds with your friends & audience."

  return (
    <Helmet>
      <title>{pageTitle ? `${pageTitle} - ` : ""}{siteName}</title>
      <meta property="og:image" content={ogImageUrl ? origin + ogImageUrl  : `${origin}/img/social.png`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={description ? description : defaultDescription} />
      <meta property="og:url" content={origin + location.path} />
      <meta property="og:site_name" content={siteName} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={`${pageTitle ? `${pageTitle} - ` : ""}${siteName}`} />
      <meta property="twitter:site" content={twitter} />
      <meta property="twitter:creator" content={twitter} />
      <meta property="twitter:description" content={description ? description : defaultDescription} />
    </Helmet>
  )
}

export default Seo
