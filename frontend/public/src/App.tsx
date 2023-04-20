import ForgeRouter from './Router';
import "./bootstrap.css"
import { GlobalContext, Provider } from './contexts/GlobalContext';
import './global.css'
import { useContext, useEffect } from 'react';

function Initializer() {
  const { initApp } = useContext(GlobalContext)

  useEffect(() => {
    initApp()
  }, [])
  return <></>
}

function App() {
  return (
    <Provider>
      <Initializer />
      <ForgeRouter />
    </Provider>
  );}


export default App;
