import React from 'react'
import { Link } from "gatsby"
import styled from 'styled-components'
import colors from '../../colors'
import { GatsbyImage } from "gatsby-plugin-image"

const Wrapper = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${colors.dark2};
  border-radius: 5px;
  border: 1px solid ${colors.dark2};
  text-decoration: none !important;

  &:hover {
    border: ${colors.hoverBorder};
  }

  a {
    color: inherit !important;
    text-decoration: none;
  }

  .link-more {
    display: none;
    visibility: hidden;
  }
`

const FeaturedImage = styled(GatsbyImage)`
  img {
    border-radius: 5px;
    padding-bottom: 20px;
  }
`

type Props = {
  to: string
  title?: string
  children?: React.ReactFragment
  post?: any // TODO: Define this model
}

function PostCard(props: Props) {
  const { to, title, children, post } = props

  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit'}}>
      <Wrapper>
        {post._featuredImage && (
          <FeaturedImage image={post._featuredImage} alt="" />
        )}
        <h2>{ title }</h2>
        <div>{ children }</div>
      </Wrapper>
    </Link>
  )
}

export default PostCard
