import React from 'react'

function Image(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  
  return (
    <img {...props} 
      onError={({ currentTarget }) => {
        currentTarget.onerror = null; // prevents looping
        currentTarget.src="/img/img-not-found.png";
      }}/>
  )
}

export default Image