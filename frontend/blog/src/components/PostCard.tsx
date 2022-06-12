import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import React from 'react'
import parse from "html-react-parser"
import styled from 'styled-components'
import { colors } from 'shared'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"


const Wrapper = styled(Link)`
  text-decoration: none;
  color: inherit;

  & > div {
    margin: 15px 0px;
    border: 1px solid rgba(0,0,0,0);
    border-radius: 5px;
  }

  img {
    border-radius: 5px;
    border: 1px solid ${colors.theme2.dark3};
  }

  &:hover {
    color: inherit;

    & > div {
      border: 1px solid ${colors.theme2.accent2};
    }
  }

  .post-excerpt {
    padding: 10px;

    .post-date {
      font-style: italic;
      margin-bottom: 5px;
      svg {
        margin-right: 5px;
      }
    }
  }
`

type Props = {
  post: any
}

function PostCard(props: Props) {
  const { post } = props

  const title = post.title
  console.log(post.excerpt)

  return (
    <Wrapper to={post.uri}>
      <div>
        {post.featuredImage && (
          <GatsbyImage
            image={post.featuredImage.node.localFile.childImageSharp.gatsbyImageData}
            alt={`"${post.title}" Featured Image`} />
        )}
        <div className="post-excerpt">
          <small className="post-date"><FontAwesomeIcon icon={faCalendar} />{post.date}</small>
          <h2>
            <span itemProp="headline">{parse(title)}</span>
          </h2>
          <div dangerouslySetInnerHTML={{__html: post.excerpt}}></div>
        </div>
      </div>
    </Wrapper>
  )
}

export default PostCard