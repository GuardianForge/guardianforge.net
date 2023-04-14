import ForgeRouter from './Router';
import "./bootstrap.css"
import { createGlobalStyle } from "styled-components"
import { Provider } from './contexts/GlobalContext';
import './global.css'

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Open Sans', sans-serif;
    box-sizing: border-box;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 10px;
  }
  .main h1 {
    margin-top: 20px !important;
  }
  body {
    color: #eee !important;
  }
  hr {
    margin: 5px 0px !important;
    border-bottom: 1px solid #eee !important;
  }
  blockquote {
    background-color: #1E1F24;
    padding: 5px;
    border-left: 5px solid border;
  }
  a {
    color: #018FFA;
    text-decoration: none;
  }
  a:hover {
    color: #004BA7;
  }
  .btn-link {
    cursor: pointer;
  }
  ins.adsbygoogle[data-ad-status="unfilled"] {
    display: none !important;
  }

  /* width */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: inherit;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: rgba(120, 120, 120, .30);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(126, 126, 126, 0.7);
  }
`

function App() {
  return (
    <Provider>
      <ForgeRouter />
    </Provider>
  );}


export default App;
