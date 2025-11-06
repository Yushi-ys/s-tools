import Navigation from "@/layout/Navigation"
import Layout from "@/layout"
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
