import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Snag1003 from "../images/snag-1003.png"
import Snag0176 from "../images/snag-0176.png"
import Snag0177 from "../images/snag-0177.png"
import Snag0180 from "../images/snag-0180.png"
import Snag0179 from "../images/snag-0179.png"
import Snag0181 from "../images/snag-0181.png"

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
      <h1>Welcome to the GuardianForge Docs</h1>
      <p>Welcome to the GuardianForge documentation. Use the menu on the left to learn how to use the site, or continue on for a short guide to get you up and running quickly.</p>

      <h2>Quick Start</h2>
      <p>GuardianForge is designed to allow you to quickly create a snapshot of a Guardians (yours or someone elses) load out and save or share it with other Destiny 2 players.</p>
      <p>Start off by finding a user in the Find Players view. Enter the player's Bungie.net username to find them. (You do not need to include the four digits that follow the name) </p>
      <img src={Snag1003} />
      <p>Once you've found the user, select any of their Guardians to see their current loadout. </p>
      <img src={Snag0176} />
      <img src={Snag0177} />

      <p>If you want to create a build, simply click Create Build. You can fill in the build name, notes, play style, and general activity which this build might be best for. If you are a content creator and make build review videos, you can also embed any YouTube URL to display it alongside the build. You can also click any ability, item, perk, or mod to highlight it on the final snapshot. This helps indicate that this component is key to the way the build works. (All fields, as well as highlighting items, are optional)</p>
      <img src={Snag0180} />
      <img src={Snag0179} />

      <p>Once you are done, click Save Build. This will save the snapshot and give you a page you can share with anyone. Using the top bar, you can easily copy it to your clipboard or share it directly to Twitter.</p>
      <img src={Snag0181} />

      <h2>Next Steps</h2>
      <p>Now that you have a general idea of how GuardianForge works, feel free to head back to the main site and create some builds! Alternatively, explore more of the documentation to learn how to use 'Forge to it's fullest.</p>

      <h2>Questions/Comments/Feedback</h2>
      <p>If you have any questions, feel free to reach out to me directly on Twitter <a href="https://twitter.com/brianmmdev" target="_blank">@brianmmdev</a> or use this <a href="https://forms.gle/5i8BG34h6Kv5F7zk9" target="_blank">feedback form</a> in the navigation bar. See you around the Tower!</p>
    </Layout>
  )
}

export default BlogIndex
