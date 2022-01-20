import React from 'react';
import './src/main.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import { Provider } from './src/contexts/GlobalContext';

// Setup FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
library.add(fas, far, fab)

export const wrapRootElement = ({element}) => {
  return (
    <Provider>
      {element}
    </Provider>
  )
}