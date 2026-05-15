import { useEffect } from 'react'
import { initCloud } from './utils/cloud'
import './app.scss'

function App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initCloud()
  }, [])

  return children
}

export default App
