import { Navigate, Route } from 'react-router-dom'
import Navbar from './components/navigation/Navbar'
import Footer from './components/navigation/Footer'
import PageTransition from './components/common/PageTransition'
import CustomCursor from './components/common/CustomCursor'
import Home from './pages/Home'
import About from './pages/About'
import Catalogue from './pages/Catalogue'
import ArtworkDetails from './pages/ArtworkDetails'

export default function App() {
  return (
    <div className="relative isolate min-h-screen bg-canvas">
      <CustomCursor />
      <Navbar />
      <main id="main-content">
        <PageTransition>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/artwork/:id" element={<ArtworkDetails />} />
          {/* /donate and /cart are retired — send it and any stale link home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
