import React from 'react'
import { Link, graphql } from "gatsby"
import PostCard from '../components/blog/PostCard'
import styled from 'styled-components'
import colors from "../colors"
import { Helmet } from 'react-helmet'

export const pageQuery = graphql`
  {
      allWpPost(sort: {
        fields: [
		      date
        ]
        order: DESC
      }) {
        edges {
          node {
            id
            title
            slug
            excerpt
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            date
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

function Blog({ data }) {
  const posts = data.allWpPost.edges
  posts.forEach(p => {
    console.log(p)
    if(p.node &&
      p.node.featuredImage &&
      p.node.featuredImage.node &&
      p.node.featuredImage.node.localFile &&
      p.node.featuredImage.node.localFile.childImageSharp &&
      p.node.featuredImage.node.localFile.childImageSharp.gatsbyImageData) {
      p.node._featuredImage = p.node.featuredImage.node.localFile.childImageSharp.gatsbyImageData
    }
    console.log("after", p)
  })

  return (
    <>
      <Helmet>
        <title>Blog - GuardianForge</title>
      </Helmet>
      <h1>Blog</h1>
      {posts.map(p => (
        <PostCard key={p.node.id} to={p.node.slug} title={p.node.title} post={p.node}>
          {p.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData && (
            <div>testint testing { JSON.stringify(p.node._featuredImage) }</div>
          )}
          <div dangerouslySetInnerHTML={{ __html: p.node.excerpt }} />
        </PostCard>
      ))}
    </>
  )
}

export default Blog
