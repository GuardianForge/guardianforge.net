import React from 'react';
import './src/main.css'
import config from './build.config.json'

import { Provider } from './src/contexts/GlobalContext';

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="adsesnseScript"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7070984643674033"
      crossOrigin="anonymous"></script>,
    <script key="analyticsScript"
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}`}></script>
  ])
}

export const wrapRootElement = ({element}) => {
  return (
    <Provider>
      {element}
    </Provider>
  )
}