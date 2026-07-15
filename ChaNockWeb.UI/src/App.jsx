import { useState, useEffect, useRef } from 'react'
import { portfolioConfig } from './portfolioConfig'
import './App.css'
import mainphoto from './assets/mainphoto.jpg'

function App() {
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('main') // 'main', 'completed', 'in-progress', 'exhibition', 'about'

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // API connection details
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const [apiStatus, setApiStatus] = useState('disconnected')

  // Admin edit / add states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Form fields state
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('completed')
  const [formType, setFormType] = useState('image')
  const [formSrc, setFormSrc] = useState('')
  const [formPoster, setFormPoster] = useState('')
  const [formCamera, setFormCamera] = useState('')
  const [formLens, setFormLens] = useState('')
  const [formAperture, setFormAperture] = useState('')
  const [formShutter, setFormShutter] = useState('')
  const [formIso, setFormIso] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formDate, setFormDate] = useState('')

  // Check login token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token === 'admin-session-token-998877') {
      setIsAdmin(true)
    }
    fetchPortfolio()

    // Prevent context menu (right-click) on media files to protect assets
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Fetch portfolio data from backend with fallback
  const fetchPortfolio = async () => {
    const urls = [
      'https://localhost:7027/api',
      'http://localhost:5069/api'
    ]

    let success = false
    for (const baseUrl of urls) {
      try {
        const response = await fetch(`${baseUrl}/portfolio`)
        if (response.ok) {
          const data = await response.json()
          setItems(data)
          setApiBaseUrl(baseUrl)
          setApiStatus('connected')
          success = true
          break
        }
      } catch (e) {
        console.warn(`Failed connection to API at ${baseUrl}:`, e.message)
      }
    }

    if (!success) {
      console.log('API offline. Falling back to local configuration mock data.')
      setItems(portfolioConfig.items)
      setApiStatus('fallback')
    }
  }

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-session-token-998877')
      setIsAdmin(true)
      setShowLoginModal(false)
      setUsername('')
      setPassword('')
    } else {
      setLoginError('Invalid credentials (use admin/admin123)')
    }
  }

  // Handle Admin Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAdmin(false)
  }

  // Reset form states
  const resetForm = () => {
    setFormTitle('')
    setFormDesc('')
    setFormCategory('completed')
    setFormType('image')
    setFormSrc('')
    setFormPoster('')
    setFormCamera('')
    setFormLens('')
    setFormAperture('')
    setFormShutter('')
    setFormIso('')
    setFormLocation('')
    setFormDate('')
    setEditingItem(null)
  }

  // Open Edit Modal
  const handleOpenEdit = (item, e) => {
    e.stopPropagation()
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDesc(item.description)
    setFormCategory(item.category)
    setFormType(item.type)
    setFormSrc(item.src)
    setFormPoster(item.poster || '')
    setFormCamera(item.metadata?.camera || '')
    setFormLens(item.metadata?.lens || '')
    setFormAperture(item.metadata?.aperture || '')
    setFormShutter(item.metadata?.shutterSpeed || '')
    setFormIso(item.metadata?.iso || '')
    setFormLocation(item.metadata?.location || '')
    setFormDate(item.metadata?.date || '')
    setShowEditModal(true)
  }

  // Save item
  const handleSaveItem = async (e) => {
    e.preventDefault()

    const itemData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      type: formType,
      src: formSrc,
      poster: formType === 'video' ? formPoster || formSrc : null,
      metadata: {
        camera: formCamera,
        lens: formLens,
        aperture: formAperture,
        shutterSpeed: formShutter,
        iso: formIso,
        location: formLocation,
        date: formDate
      }
    }

    if (apiStatus === 'fallback') {
      if (editingItem) {
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i))
      } else {
        const newItem = {
          ...itemData,
          id: `local-${Date.now()}`,
          order: items.length + 1
        }
        setItems([...items, newItem])
      }
      setShowAddModal(false)
      setShowEditModal(false)
      resetForm()
      return
    }

    try {
      const url = editingItem
        ? `${apiBaseUrl}/portfolio/${editingItem.id}`
        : `${apiBaseUrl}/portfolio`
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      if (response.ok) {
        fetchPortfolio()
        setShowAddModal(false)
        setShowEditModal(false)
        resetForm()
      } else {
        alert('Failed to save portfolio item on server.')
      }
    } catch (err) {
      alert('Error communicating with backend API server.')
    }
  }

  // Delete item
  const handleDeleteItem = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this item?')) return

    if (apiStatus === 'fallback') {
      setItems(items.filter(i => i.id !== id))
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/portfolio/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPortfolio()
      } else {
        alert('Failed to delete portfolio item from server.')
      }
    } catch (err) {
      alert('Error communicating with backend API server.')
    }
  }

  // Reorder
  const handleReorder = async (currentIndex, direction, e) => {
    e.stopPropagation()
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const reorderedList = [...items]
    const temp = reorderedList[currentIndex]
    reorderedList[currentIndex] = reorderedList[targetIndex]
    reorderedList[targetIndex] = temp

    setItems(reorderedList)

    if (apiStatus !== 'fallback') {
      try {
        await fetch(`${apiBaseUrl}/portfolio/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemIds: reorderedList.map(i => i.id) })
        })
      } catch (err) {
        console.error('Failed to save order on backend:', err)
      }
    }
  }

  // Filter items for current active view
  const filteredItems = items.filter(item => item.category === activeCategory)

  // Get active category label
  const activeCategoryLabel = portfolioConfig.categories.find(c => c.id === activeCategory)?.label || ''

  // Subtitle to display: from the first item
  const sectionSubtitle = filteredItems.length > 0 ? (filteredItems[0].subtitle || filteredItems[0].description || filteredItems[0].title) : ''

  return (
    <div className="portfolio-app minimal-layout">
      {/* Top Navbar */}
      <header className={`portfolio-nav ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-container">
          <div className="brand" onClick={() => { setActiveCategory('main'); setIsMenuOpen(false); }}>
            {portfolioConfig.brandName}
          </div>

          {/* Hamburger Menu Icon (3 lines) */}
          <button
            className={`hamburger-menu-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </header>

      {/* Navigation Overlay (Sidebar Menu) */}
      <div className={`nav-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <nav className="overlay-menu-links">
          {portfolioConfig.categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-link-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Subtle Admin Action Link inside Menu */}
        <div className="admin-menu-footer">
          {isAdmin ? (
            <button onClick={handleLogout} className="admin-action-btn">Admin Logout</button>
          ) : (
            <button onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }} className="admin-action-btn">Admin Access</button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {/* API Status Banner (Subtle indicator for developer/demo) */}
        {apiStatus !== 'connected' && (
          <div className="demo-badge">Demo Mode</div>
        )}

        {/* Dynamic View rendering */}
        {activeCategory === 'main' && (
          <section className="view-section main-view">
            <div className="main-photo-container">
              <img 
                src={mainphoto} 
                alt="Main" 
                className="main-photo"
                loading="eager"
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </section>
        )}

        {(activeCategory === 'completed' || activeCategory === 'in-progress') && (
          <section className="view-section works-view">
            {/* Header elements inspired by the reference image */}
            <div className="works-header-section">
              <h1 className="works-main-title">{activeCategoryLabel}</h1>
              {sectionSubtitle && <p className="works-subtitle">{sectionSubtitle}</p>}
            </div>

            {isAdmin && (
              <div className="admin-section-actions">
                <button className="btn-add-item" onClick={() => setShowAddModal(true)}>+ Add Work</button>
              </div>
            )}

            {/* Vertical Irregular layout list of images (No Lightbox) */}
            <div className="irregular-vertical-flow">
              {filteredItems.map((item, index) => {
                // Irregular layout variation classes based on index
                const layoutTypes = ['layout-left', 'layout-right', 'layout-center'];
                const layoutClass = layoutTypes[index % layoutTypes.length];

                return (
                  <div key={item.id} className={`flow-item-wrapper ${layoutClass}`}>
                    <MediaCard item={item} />
                    {isAdmin && (
                      <div className="admin-item-controls">
                        <button onClick={(e) => handleReorder(index, 'left', e)}>←</button>
                        <button onClick={(e) => handleOpenEdit(item, e)}>Edit</button>
                        <button onClick={(e) => handleDeleteItem(item.id, e)}>Delete</button>
                        <button onClick={(e) => handleReorder(index, 'right', e)}>→</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeCategory === 'exhibition' && (
          <section className="view-section exhibition-section">
            <div className="exhibition-header-section">
              <h1 className="works-main-title">{activeCategoryLabel}</h1>
            </div>
            <div className="exhibition-list">
              {portfolioConfig.exhibitions.map((ex, idx) => (
                <div key={idx} className="exhibition-item">
                  <span className="ex-year">{ex.year}</span>
                  <div className="ex-details">
                    <span className="ex-title">{ex.title}</span>
                    <span className="ex-location">{ex.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeCategory === 'about' && (
          <section className="view-section about-section">
            <div className="about-content">
              <h1 className="about-name">ABOUT</h1>
              <div className="about-bio-container">
                <p className="about-bio">{portfolioConfig.bio}</p>
              </div>
              <div className="about-contact">
                <a href={`mailto:${portfolioConfig.email}`} className="contact-link">{portfolioConfig.email}</a>
                <div className="social-links">
                  <a href={portfolioConfig.instagram} target="_blank" rel="noreferrer">Instagram</a>
                  <a href={portfolioConfig.behance} target="_blank" rel="noreferrer">Behance</a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="portfolio-footer">
        {activeCategory === 'main' && (
          <div className="main-instagram-link-container">
            <a 
              href={portfolioConfig.instagram} 
              target="_blank" 
              rel="noreferrer" 
              className="main-instagram-link"
            >
              Instagram
            </a>
          </div>
        )}
        <p>© {new Date().getFullYear()} {portfolioConfig.photographerName}. All rights reserved.</p>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Admin Login</h3>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {loginError && <p className="error-text">{loginError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLoginModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Media Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
          <div className="media-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{showEditModal ? 'Edit Media Metadata' : 'Add New Portfolio Media'}</h3>
            <form onSubmit={handleSaveItem}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="completed">WORKS #1</option>
                    <option value="in-progress">WORKS #2</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} required rows="2" />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Media Source Link</label>
                  <input type="text" value={formSrc} onChange={(e) => setFormSrc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Media Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                    <option value="image">Still Photography (Image)</option>
                    <option value="video">Video Loop (MP4)</option>
                  </select>
                </div>
              </div>

              {formType === 'video' && (
                <div className="form-group">
                  <label>Video Poster Cover Image</label>
                  <input type="text" value={formPoster} onChange={(e) => setFormPoster(e.target.value)} />
                </div>
              )}

              <div className="exif-form-section">
                <h4>EXIF / CAMERA METADATA</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Camera Model</label>
                    <input type="text" value={formCamera} onChange={(e) => setFormCamera(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Lens</label>
                    <input type="text" value={formLens} onChange={(e) => setFormLens(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Aperture</label>
                    <input type="text" value={formAperture} onChange={(e) => setFormAperture(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Shutter Speed</label>
                    <input type="text" value={formShutter} onChange={(e) => setFormShutter(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>ISO</label>
                    <input type="text" value={formIso} onChange={(e) => setFormIso(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Capture Date</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn-accent">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaCard({ item }) {
  const videoRef = useRef(null)

  return (
    <div className={`media-card-item static-item ${item.type}`}>
      <div className="card-media-box">
        {item.type === 'video' ? (
          <video
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            muted
            loop
            autoPlay
            playsInline
            className="card-asset video-asset"
          />
        ) : (
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            className="card-asset image-asset"
            onDragStart={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  )
}

export default App
