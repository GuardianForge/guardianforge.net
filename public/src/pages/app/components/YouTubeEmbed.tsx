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
  }
`

type Props = {
  youtubeUrl: string
}

function YouTubeEmbed(props: Props) {
  const { youtubeUrl } = props

  const [videoId, setVideoId] = useState("")

  useEffect(() => {
    let splitUrl = youtubeUrl.split("/")
    let videoId = splitUrl[splitUrl.length - 1]
    videoId = videoId.replace("watch?v=", "")
    setVideoId(videoId)
  }, [])

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
    </Wrapper>
  )
}

export default YouTubeEmbed
