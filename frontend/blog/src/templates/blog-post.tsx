import React from "react"
import { Link, graphql, navigate } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import parse from "html-react-parser"
import "../css/@wordpress/block-library/build-style/style.css"
import "../css/@wordpress/block-library/build-style/theme.css"
import { colors, ForgeButton } from 'shared'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const Wrapper = styled(Layout)`
  .post-date {
    font-style: italic;
    svg {
      margin-right: 5px;
    }
  }

  h1 {
    margin-top: 5px;
  }

  .post-content {
    h2 {
      margin-top: 30px;
    }

    img {
      height: auto;
      max-width: 100%;
      border: 1px solid ${colors.theme2.dark3};
      margin: 10px 0px;
    }
  }
`

export const pageQuery = graphql`
  query BlogPostById(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    post: wpPost(id: { eq: $id }) {
      id
      author {
				node {
					name
          firstName
          description
          avatar {
						url
          }
        }
      }
      excerpt
      content
      title
      date(formatString: "MMMM DD, YYYY")
      featuredImage {
        node {
          altText
          localFile {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: TRACED_SVG
                layout: FULL_WIDTH
              )
            }
          }
        }
      }
    }
    previous: wpPost(id: { eq: $previousPostId }) {
      uri
      title
    }
    next: wpPost(id: { eq: $nextPostId }) {
      uri
      title
    }
  }
`

type Props = {
  data: any
}

const BlogPostTemplate = (props: Props) => {
  const { data: { previous, next, post } } = props

  const featuredImage = {
    data: post.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: post.featuredImage?.node?.alt || ``,
  }

  return (
    <Wrapper>
      <Seo title={post.title} description={post.excerpt} />

      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <small className="post-date"><FontAwesomeIcon icon={faCalendar} />{post.date}</small>
          <h1 itemProp="headline">{parse(post.title)}</h1>
          {/* if we have a featured image for this post let's display it */}
          {featuredImage?.data && (
            <GatsbyImage
              image={featuredImage.data}
              alt={featuredImage.alt}
              style={{ marginBottom: 50 }}
            />
          )}
        </header>

        {!!post.content && (
          <div className="post-content">{parse(post.content)}</div>
        )}

        <hr />

        <footer>
          <Bio author={post.author.node} />
        </footer>
      </article>

      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <ForgeButton onClick={() => navigate(previous.uri)}>
                ← {parse(previous.title)}
              </ForgeButton>
            )}
          </li>

          <li>
            {next && (
              <ForgeButton onClick={() => navigate(next.uri)}>
                {parse(next.title)} →
              </ForgeButton>
            )}
          </li>
        </ul>
      </nav>
    </Wrapper>
  )
}

export default BlogPostTemplate
