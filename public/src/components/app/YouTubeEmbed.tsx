import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  margin-bottom: 10px;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }

  .video-embed-placeholder {
    height: 200px;
    background-color: rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #aaa;
    font-style: italic;
    border-radius: 5px;
    text-align: center;
    padding: 10px;
  }
`

type Props = {
  youtubeUrl: string
  showPlaceholder?: boolean
}

function YouTubeEmbed(props: Props) {
  const { youtubeUrl, showPlaceholder } = props

  const [videoId, setVideoId] = useState("")

  useEffect(() => {
    let splitUrl = youtubeUrl.split("/")
    let videoId = splitUrl[splitUrl.length - 1]
    videoId = videoId.replace("watch?v=", "")
    setVideoId(videoId)
  }, [youtubeUrl])

  return (
    <Wrapper>
      {videoId !== "" && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen>
        </iframe>
      )}
      {showPlaceholder && videoId === "" && (
        <div className="video-embed-placeholder">
          Paste a link above to preview the video.
        </div>
      )}
    </Wrapper>
  )
}

export default YouTubeEmbed
