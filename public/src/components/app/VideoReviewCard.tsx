import React from 'react';
import styled from 'styled-components';
import Card from './ui/Card';
import YouTubeEmbed from './YouTubeEmbed';

const Wrapper = styled(Card)`

`

type Props = {
  youtubeUrl: string
}

function VideoReviewCard(props: Props) {
  const { youtubeUrl } = props

  return (
    <Wrapper title="Video Review">
      <YouTubeEmbed youtubeUrl={youtubeUrl} />
    </Wrapper>
  )
}

export default VideoReviewCard;
