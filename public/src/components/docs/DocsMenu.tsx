import React from 'react'
import { StaticQuery, graphql, Link } from 'gatsby'
import styled from 'styled-components'
import colors from '../../colors'
import { useLocation } from '@reach/router';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.dark2};
  margin: 10px;
  border-radius: 5px;
  padding: 10px;

  a {
		text-decoration: none;
		color: #aaa;
		padding: 5px;
		margin: 5px;

		&:hover {
			color: #fff;
      cursor: pointer;
		}
  }

  .active {
    color: #fff;
    font-weight: 800;
  }
`

function DocsMenu() {
  const location = useLocation()
  return (
    <StaticQuery
      query={graphql`
        {
          allWpDocument {
            edges {
              node {
                id
                title
                slug
              }
            }
          }
        }
      `}
      render={data => (
        <Wrapper>
          <Link to="/docs" className={location.pathname === '/docs' ? 'active' : ''}>Quick Start</Link>
          {data.allWpDocument.edges.map((e: any) => (
            <Link to={`/docs/${e.node.slug}`} className={location.pathname === `/docs/${e.node.slug}` ? 'active' : ''}>{e.node.title}</Link>
          ))}
        </Wrapper>
      )}
    />
  )
}

export default DocsMenu
