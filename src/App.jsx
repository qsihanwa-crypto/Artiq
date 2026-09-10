import { Navigate, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navigation/Navbar'
import Footer from './components/navigation/Footer'
import PageTransition from './components/common/PageTransition'
import CustomCursor from './components/common/CustomCursor'
import Home from './pages/Home'
import About from './pages/About'
import Catalogue from './pages/Catalogue'
import ArtworkDetails from './pages/ArtworkDetails'
import Cart from './pages/Cart'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminAbout from './admin/AdminAbout'
import AdminHome from './admin/AdminHome'
import AdminCart from './admin/AdminCart'
import AdminSite from './admin/AdminSite'
import AdminPlaceholder from './admin/AdminPlaceholder'
import AdminArtworkList from './admin/AdminArtworkList'
import AdminArtworkForm from './admin/AdminArtworkForm'
import { RequireAuth } from './admin/RequireAuth'

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="relative isolate min-h-screen bg-canvas">
      {!isAdmin && <CustomCursor />}
      {!isAdmin && <Navbar />}
      <main id="main-content">
        <PageTransition>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<AdminHome title="Home editor" />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="catalogue" element={<AdminArtworkList />} />
            <Route path="catalogue/new" element={<AdminArtworkForm />} />
            <Route path="catalogue/:id" element={<AdminArtworkForm />} />
            <Route path="cart" element={<AdminCart />} />
            <Route path="site" element={<AdminSite />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/artwork/:id" element={<ArtworkDetails />} />
          <Route path="/cart" element={<Cart />} />
          {/* /donate is retired — send it and any stale link home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </PageTransition>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}
