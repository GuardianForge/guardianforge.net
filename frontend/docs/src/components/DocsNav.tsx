import React from 'react'
import { Link, graphql, useStaticQuery } from "gatsby"
import styled from 'styled-components'
import { colors } from 'shared'
import { Nav } from 'react-bootstrap'

const Wrapper = styled(Nav)`
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  margin-bottom: 10px;

  a {
    color: ${colors.theme2.text};

    &:hover {
      color: ${colors.theme2.text2};
    }

    .active {
      color: ${colors.theme2.accent1};
    }
  }
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
  // posts.forEach(el => el.uri.startsWith("/docs/docs") ? el.uri = el.uri.replace("/docs") : null)
  // console.log("posts", posts)

  return (
    <Wrapper defaultActiveKey="/" className="flex-column">
      <Nav.Link as={Link} to="/">Quick Start</Nav.Link>
      {posts.map(post =>
        <Nav.Link as={Link} to={`/${post.slug}`}>{post.title}</Nav.Link>
      )}
    </Wrapper>
  )
}

export default DocsNav