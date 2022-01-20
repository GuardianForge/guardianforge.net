import { graphql } from 'gatsby'
import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

export const pageQuery = graphql`
  query PostById(
    $id: String
  ) {
      wpPost(id: {
        eq: $id
      }) {
        id
        excerpt
        slug
        title
        content
        # uri
        # content
        # contentParsed
        # contentFiles {
        #   publicURL
        #   childImageSharp {
        #     fluid(maxWidth: 720) {
        #       ...GatsbyImageSharpFluid_withWebp
        #       presentationWidth
        #     }
        #   }
        # }
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

function Post({ data }) {
  // const post = data.markdownRemark
  const post = data.wpPost
  const { siteUrl } = data.site.siteMetadata
  // let featuredImgFluid = post.frontmatter.featuredImage.childImageSharp.fluid

  return (
    <>
      <Helmet>
        <title>{post.title} - GuardianForge</title>
        <meta property="og:url" content={`${siteUrl}/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={post.excerpt} />
      </Helmet>
      <h1>{post.title}</h1>
      {/* <Img fluid={featuredImgFluid} /> */}
      {/* <PostBodyWrapper>{contentParser({ content: contentParsed, files: contentFiles }, { wordPressUrl, uploadsUrl })}</PostBodyWrapper> */}

      <PostBodyWrapper dangerouslySetInnerHTML={{ __html: post.content }} />
    </>
  )
}

export default Post
