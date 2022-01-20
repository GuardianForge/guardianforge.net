import React from 'react'
import { Link } from 'gatsby'
import { Helmet } from 'react-helmet'

function About() {
  return (
    <div className="about container">
      <Helmet>
        <title>About - GuardianForge</title>
      </Helmet>
      <div className="row">
        <h1>About GuardianForge</h1>
      </div>
      <div className="row page-body">
        <p><strong>GuardianForge</strong> is a platform to easily create a sharable link of your build within Destiny 2.</p>

        <blockquote>
          For information on how to use GuardianForge, please see the <Link to="/docs">Docs</Link>.
        </blockquote>

        <h3>How it Started</h3>

        <p>My name is Brian, I am a full stack developer based out of Chicago as well as a pretty big fan of the Destiny universe. The idea for GuardianForge came to me as I was watching creators on YouTube describe a build while explaining how the various equipment, subclasses, mods, etc. all work together to make their characters do some pretty cool things. I enjoy watching these videos, but have a hard time remembering all the things they describe. So I thought "it would be great if there was a simple way to outline everything they have equipped while describing this build…"</p>

        <p><i>And after a few weeks, GuardianForge was born!</i></p>

        <p>I plan to further document the journey on my <a href="https://brianmorrison.me/blog" target="_blank">personal blog</a> and YouTube channel over the coming weeks. Feel free to follow me <a href="https://twitter.com/brianmmdev" target="_blank">@brianmmdev</a> or <a href="https://twitter.com/guardianforge" target="_blank">@guardianforge</a> on Twitter for updates as they are released.</p>

        <h3>Platform Vision & Whats Next</h3>

        <p>As I've been building GuardianForge, new and interesting ways in which the platform kept coming to me. Here are a few things I have planned for GF.</p>

        <b>Build Ratings</b>

        <p>Users will be able to rate & comment on a build. This will help create a database of the best builds for the community to try out.</p>

        <b>Builds by Activity</b>

        <p>If you are looking for a build that accommodates a specific activity, this will help narrow down which ones work the best.</p>

        <b>Fireteam Builds</b>

        <p>Looking to jump into a Raid or Grandmaster? Pull up a collection of builds grouped together so your entire fireteam can be setup for success.</p>

        <b>Build Favorites</b>

        <p>Save your favorite builds to quickly refer back to them in the future.</p>

        <b>Apply Builds</b>

        <p>If you find a build you want to try, this will allow you to equip an entire build with a click of a button. (This is a big one and will likely be a while...)</p>

        <h3>A note about Monetization</h3>

        <p>While GuardianForge will remain free to use, it does cost time & money to build a product like this. At some point during the beta, I'll be placing ads throughout the site in various places in a tasteful way. Meaning I wont be overloading the entire app with ads to make it unusable.</p>

        <p>At some point, a premium version will also be released that will add additional features (some of which may be listed above) as well as remove ads from the site.</p>

        <p><i>Have other suggestions? Feel free to give me feedback using <a href="https://forms.gle/5i8BG34h6Kv5F7zk9" target="_blank">this form.</a></i></p>
      </div>
    </div>
  )
}

export default About
