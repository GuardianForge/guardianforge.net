import { graphql } from 'gatsby'
import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import DocsMenu from '../components/docs/DocsMenu'

export const pageQuery = graphql`
  query DocById(
    $id: String
  ) {
      wpDocument(id: {
        eq: $id
      }) {
        id
        slug
        title
        content
    }

    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`


const PostBodyWrapper = styled.div`
  img {
    border-radius: 5px;
    border: 1px solid #444444;
    max-width: 100%;
    height: auto;
    width: auto;
  }

  blockquote {
    border-radius: 5px;
    padding: 10px;

    p {
      margin-bottom: 0 !important;
    }
  }
`

function Doc({ data }) {
  const doc = data.wpDocument
  const { siteUrl } = data.site.siteMetadata
  return (
    <>
      <Helmet>
        <title>{doc.title} - GuardianForge</title>
        <meta property="og:url" content={`${siteUrl}/${doc.slug}`} />
        <meta property="og:title" content={doc.title} />
        <meta property="og:description" content={doc.excerpt} />
        <meta property="twitter:title" content={doc.title} />
        <meta property="twitter:description" content={doc.excerpt} />
      </Helmet>
      <div className="row">
        <div className="col-md-4">
          <DocsMenu />
        </div>
        <div className="col-md-8">
          <h1>{doc.title}</h1>
          {/* <Img fluid={featuredImgFluid} /> */}
          {/* <PostBodyWrapper>{contentParser({ content: contentParsed, files: contentFiles }, { wordPressUrl, uploadsUrl })}</PostBodyWrapper> */}

          <PostBodyWrapper dangerouslySetInnerHTML={{ __html: doc.content }} />
        </div>
      </div>

    </>
  )
}

export default Doc
