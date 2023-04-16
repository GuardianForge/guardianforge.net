import { faDiscord, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <div className='h-[56px] p-2 flex border-t border-t-neutral-800'>
      <div className='flex flex-1 gap-3 items-center font-bold'>
        <Link to="/about">About</Link>
        <a href="/docs">Docs</a>
        <a href="/blog">Blog</a>
        <a href="https://discord.gg/tctVKqXG6g" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDiscord} /></a>
        <a href="https://twitter.com/guardianforge" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faTwitter} /></a>
        <a href="https://www.instagram.com/guardianforge" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
      </div>
      <div className='flex items-center'>
        Made with ❤️ by&nbsp; <a href="https://twitter.com/brianmmdev" className='underline' target="_blank" rel="noreferrer">@brianmmdev</a>&nbsp;•&nbsp;<a href="https://www.buymeacoffee.com/brianmmdev" className="underline" target="_blank" rel="noreferrer">Buy me a coffee</a>!
      </div>
    </div>
  )
}

export default Footer