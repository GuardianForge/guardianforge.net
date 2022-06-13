import React from 'react'
import { Link, graphql, useStaticQuery } from "gatsby"
import styled from 'styled-components'

const Wrapper = styled.div`
  background-color: red;
`

function DocsNav() {

  const data = useStaticQuery(graphql`
    {
    allWpDocument {
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
  `)

  const posts = data.allWpDocument.edges.map(el => el.node)

  return (
    <Wrapper>
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => <Link to={post.uri}>{post.title}</Link>)}
      </ol>
    </Wrapper>
  )
}

export default DocsNav