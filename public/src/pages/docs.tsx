import React from 'react'
import styled from 'styled-components'
import DocsMenu from '../components/docs/DocsMenu'

const Wrapper = styled.div`
  img {
    max-width: 100%;
    height: auto;
    width: auto;
    border: 1px solid #444444;
    margin: 10px 0px;
  }
`

function Docs() {
  return (
    <Wrapper className="row">
      <div className="col-md-4">
        <DocsMenu />
      </div>
      <div className="col-md-8">
      <h1>Welcome to the GuardianForge Docs</h1>
        <p>Welcome to the GuardianForge documentation. Use the menu on the left to learn how to use the site, or continue on for a short guide to get you up and running quickly.</p>

        <h2>Quick Start</h2>
        <p>GuardianForge is designed to allow you to quickly create a snapshot of a Guardians (yours or someone elses) load out and save or share it with other Destiny 2 players.</p>
        <p>Start off by finding a user in the Find Players view. Enter the player's Bungie.net username to find them. (You do not need to include the four digits that follow the name) </p>
        <img src="/img/docs/snag-1003.png" />
        <p>Once you've found the user, select any of their Guardians to see their current loadout. </p>
        <img src="/img/docs/snag-0176.png" />
        <img src="/img/docs/snag-0177.png" />

        <p>If you want to create a build, simply click Create Build. You can fill in the build name, notes, play style, and general activity which this build might be best for. If you are a content creator and make build review videos, you can also embed any YouTube URL to display it alongside the build. You can also click any ability, item, perk, or mod to highlight it on the final snapshot. This helps indicate that this component is key to the way the build works. (All fields, as well as highlighting items, are optional)</p>
        <img src="/img/docs/snag-0180.png" />
        <img src="/img/docs/snag-0179.png" />

        <p>Once you are done, click Save Build. This will save the snapshot and give you a page you can share with anyone. Using the top bar, you can easily copy it to your clipboard or share it directly to Twitter.</p>
        <img src="/img/docs/snag-0181.png" />

        <h2>Next Steps</h2>
        <p>Now that you have a general idea of how GuardianForge works, feel free to head back to the main site and create some builds! Alternatively, explore more of the documentation to learn how to use 'Forge to it's fullest.</p>

        <h2>Questions/Comments/Feedback</h2>
        <p>If you have any questions, feel free to reach out to me directly on Twitter <a href="https://twitter.com/brianmmdev" target="_blank">@brianmmdev</a> or use this <a href="https://forms.gle/5i8BG34h6Kv5F7zk9" target="_blank">feedback form</a> in the navigation bar. See you around the Tower!</p>
      </div>
    </Wrapper>
  )
}

export default Docs
