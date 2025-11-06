import Navigation from "@/Layout/Navigation"
import Layout from "@/Layout"
import './App.css'
import { useDevTools } from "@/hooks/useDevTools"

function App() {
  useDevTools()

  return (
    <div>
      <Navigation />
      <Layout />
    </div>
  )
}

export default App
