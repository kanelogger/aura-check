import { useEffect } from 'react'
import { initCloud } from './utils/cloud'
import './app.scss'

function App({ children }) {
  useEffect(() => {
    initCloud()
  }, [])

  return children
}

export default App
