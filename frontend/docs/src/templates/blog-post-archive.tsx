import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PostCard from "../components/PostCard"
import DocsNav from "../components/DocsNav"

export const pageQuery = graphql`
  {
    allWpDocument(sort: { fields: [date], order: DESC }) {
      edges {
        node {
          id
          title
          slug
          uri
          date(formatString: "MMMM DD, YYYY")
          status
          featuredImage {
            node {
              localFile {
                childImageSharp {
                  gatsbyImageData
                }
              }
            }
          }
        }
      }
    }
  }
`

type Props = {
  data: any
  pageContext: any
}

const BlogIndex = (props: Props) => {
  const {
    data,
    pageContext: { nextPagePath, previousPagePath },
  } = props


  const posts = data.allWpDocument.edges.map(el => el.node)

  if (!posts.length) {
    return (
      <Layout>
        <Seo title="All posts" />
        <p>
          No blog posts found. Add posts to your WordPress site and they'll
          appear here!
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <Seo title="All posts" />
      <div>
        Home page goes here
      </div>
    </Layout>
  )
}

export default BlogIndex
