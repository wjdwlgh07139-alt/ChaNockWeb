import { useState, useEffect, useRef } from 'react'
import { portfolioConfig } from './portfolioConfig'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [accentColor, setAccentColor] = useState(portfolioConfig.defaultTheme.primaryColor)
  const [showCustomizer, setShowCustomizer] = useState(false)

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
  // API connection details
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const [apiStatus, setApiStatus] = useState('disconnected') // 'connected' | 'disconnected' | 'fallback'

  // Admin edit / add states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Form fields state
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('nature')
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
  }, [])

  // Apply general theme to data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Apply custom accent color to CSS root variable
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '170, 59, 255'
    }
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(accentColor))
  }, [accentColor])

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
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    if (apiStatus === 'fallback') {
      // Local mock login if backend is not running
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminToken', 'admin-session-token-998877')
        setIsAdmin(true)
        setShowLoginModal(false)
        setUsername('')
        setPassword('')
      } else {
        setLoginError('Invalid local username or password (use admin/admin123)')
      }
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        setIsAdmin(true)
        setShowLoginModal(false)
        setUsername('')
        setPassword('')
      } else {
        const errData = await response.json().catch(() => ({}))
        setLoginError(errData.message || 'Login failed. Check credentials.')
      }
    } catch (err) {
      setLoginError('Server error connecting to authentication endpoint.')
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
    setFormCategory('nature')
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

  // Open Edit Modal with selected item data
  const handleOpenEdit = (item, e) => {
    e.stopPropagation()
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDesc(item.description)
    setFormCategory(item.category)
    setFormType(item.type)
    setFormSrc(item.src)
    setFormPoster(item.poster || '')
    setFormCamera(item.metadata.camera)
    setFormLens(item.metadata.lens)
    setFormAperture(item.metadata.aperture)
    setFormShutter(item.metadata.shutterSpeed)
    setFormIso(item.metadata.iso)
    setFormLocation(item.metadata.location)
    setFormDate(item.metadata.date)
    setShowEditModal(true)
  }

  // Save new or updated item
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
      // Local state modification
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

  // Delete portfolio item
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

  // Live Reorder items (Left/Right layout modification)
  const handleReorder = async (currentIndex, direction, e) => {
    e.stopPropagation()
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const reorderedList = [...items]
    const temp = reorderedList[currentIndex]
    reorderedList[currentIndex] = reorderedList[targetIndex]
    reorderedList[targetIndex] = temp

    // Locally update state immediately for smooth UI feedback
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

  // Filter items based on active category
  const filteredItems = items.filter(item => 
    activeCategory === 'all' ? true : item.category === activeCategory
  )

  const selectedIndex = items.findIndex(item => item.id === selectedItem?.id)

  const handlePrev = (e) => {
    e.stopPropagation()
    const newIndex = (selectedIndex - 1 + items.length) % items.length
    setSelectedItem(items[newIndex])
  }

  const handleNext = (e) => {
    e.stopPropagation()
    const newIndex = (selectedIndex + 1) % items.length
    setSelectedItem(items[newIndex])
  }

  return (
    <div className="portfolio-app">
      {/* Header/Navbar */}
      <header className="portfolio-nav">
        <div className="nav-container">
          <div className="brand">{portfolioConfig.brandName}</div>
          <nav className="nav-links">
            <a href="#gallery">Gallery</a>
            <a href="#about">About</a>
            <a href={portfolioConfig.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={portfolioConfig.behance} target="_blank" rel="noreferrer">Behance</a>
          </nav>
          <div className="nav-actions">
            {isAdmin ? (
              <button className="btn-logout" onClick={handleLogout}>Admin Logout</button>
            ) : (
              <button className="btn-login" onClick={() => setShowLoginModal(true)}>Admin Login</button>
            )}
            <button 
              className="btn-customizer-toggle" 
              onClick={() => setShowCustomizer(!showCustomizer)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span>Design Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="about">
        <div className="hero-grid">
          <div className="hero-text-content">
            <span className="hero-eyebrow">PORTFOLIO</span>
            <h1 className="hero-title">{portfolioConfig.photographerName}</h1>
            <p className="hero-subtitle">{portfolioConfig.photographerTitle}</p>
            <p className="hero-bio">{portfolioConfig.bio}</p>
            <div className="hero-cta">
              <a href="#gallery" className="btn-primary-portfolio">Explore Exhibition</a>
              <a href={`mailto:${portfolioConfig.email}`} className="btn-secondary-portfolio">Get in Touch</a>
            </div>
          </div>
          <div className="hero-featured-wrapper">
            <div className="hero-featured-card">
              {items.length > 0 && (
                <>
                  <img src={items[0].src} alt="Featured Work" className="hero-featured-img" />
                  <div className="hero-featured-overlay">
                    <span className="featured-tag">FEATURED WORK</span>
                    <h3>{items[0].title}</h3>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / Exhibition Grid */}
      <section className="gallery-section" id="gallery">
        <div className="gallery-header-row">
          <div className="filters-container">
            {portfolioConfig.categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button className="btn-add-item" onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Media</span>
            </button>
          )}
        </div>

        {/* API Status Banner */}
        <div className="api-status-banner">
          {apiStatus === 'connected' ? (
            <span className="status-badge live">● Live API Connected: {apiBaseUrl}</span>
          ) : (
            <span className="status-badge offline">⚠ API Offline (Demo Mode). Changes will reset on reload.</span>
          )}
        </div>

        {/* Media Grid */}
        <div className="media-grid">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="grid-item-container">
              <MediaCard 
                item={item} 
                onClick={() => setSelectedItem(item)} 
              />
              
              {isAdmin && (
                <div className="admin-actions-bar">
                  <div className="reorder-arrows">
                    <button 
                      disabled={index === 0} 
                      onClick={(e) => handleReorder(index, 'left', e)}
                      title="Move Layout Left"
                    >
                      ←
                    </button>
                    <button 
                      disabled={index === items.length - 1} 
                      onClick={(e) => handleReorder(index, 'right', e)}
                      title="Move Layout Right"
                    >
                      →
                    </button>
                  </div>
                  <div className="item-management">
                    <button className="btn-edit" onClick={(e) => handleOpenEdit(item, e)}>Edit</button>
                    <button className="btn-delete" onClick={(e) => handleDeleteItem(item.id, e)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Admin Authentication</h3>
            <p>Access portfolio arrangement and curation panel.</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="admin"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="admin123"
                />
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
                    <option value="nature">Nature & Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="architecture">Architecture</option>
                    <option value="video">Moving Image (Video)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} required rows="2" />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Media Source Link (Image or MP4 Video)</label>
                  <input type="text" value={formSrc} onChange={(e) => setFormSrc(e.target.value)} placeholder="/src/assets/portfolio_nature.png or Mixkit/CDN URL" required />
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
                  <label>Video Poster Cover image</label>
                  <input type="text" value={formPoster} onChange={(e) => setFormPoster(e.target.value)} placeholder="/src/assets/portfolio_nature.png" />
                </div>
              )}

              <div className="exif-form-section">
                <h4>EXIF / CAMERA METADATA</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Camera Model</label>
                    <input type="text" value={formCamera} onChange={(e) => setFormCamera(e.target.value)} placeholder="e.g. Sony A7R V" />
                  </div>
                  <div className="form-group">
                    <label>Lens</label>
                    <input type="text" value={formLens} onChange={(e) => setFormLens(e.target.value)} placeholder="e.g. 24-70mm f/2.8" />
                  </div>
                  <div className="form-group">
                    <label>Aperture</label>
                    <input type="text" value={formAperture} onChange={(e) => setFormAperture(e.target.value)} placeholder="e.g. f/8.0" />
                  </div>
                  <div className="form-group">
                    <label>Shutter Speed</label>
                    <input type="text" value={formShutter} onChange={(e) => setFormShutter(e.target.value)} placeholder="e.g. 1/160s" />
                  </div>
                  <div className="form-group">
                    <label>ISO</label>
                    <input type="text" value={formIso} onChange={(e) => setFormIso(e.target.value)} placeholder="e.g. 100" />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="e.g. Seoul, Korea" />
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

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="lightbox-overlay" onClick={() => setSelectedItem(null)}>
          <button className="lightbox-close" onClick={() => setSelectedItem(null)}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button className="nav-arrow prev" onClick={handlePrev}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-media-wrapper">
              {selectedItem.type === 'video' ? (
                <video src={selectedItem.src} controls autoPlay loop className="lightbox-media" />
              ) : (
                <img src={selectedItem.src} alt={selectedItem.title} className="lightbox-media" />
              )}
            </div>
            
            <div className="lightbox-sidebar">
              <div className="sidebar-main">
                <span className="sidebar-category">{selectedItem.category}</span>
                <h2 className="sidebar-title">{selectedItem.title}</h2>
                <p className="sidebar-desc">{selectedItem.description}</p>
                {selectedItem.metadata.location && (
                  <div className="location-badge">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{selectedItem.metadata.location}</span>
                  </div>
                )}
              </div>

              <div className="sidebar-divider"></div>

              <div className="sidebar-exif">
                <h3>CAMERA DETAILS</h3>
                <div className="exif-grid">
                  <div className="exif-item">
                    <span className="exif-label">Camera</span>
                    <span className="exif-value">{selectedItem.metadata.camera}</span>
                  </div>
                  <div className="exif-item">
                    <span className="exif-label">Lens</span>
                    <span className="exif-value">{selectedItem.metadata.lens}</span>
                  </div>
                  <div className="exif-item">
                    <span className="exif-label">Aperture</span>
                    <span className="exif-value">{selectedItem.metadata.aperture}</span>
                  </div>
                  <div className="exif-item">
                    <span className="exif-label">Shutter Speed</span>
                    <span className="exif-value">{selectedItem.metadata.shutterSpeed}</span>
                  </div>
                  <div className="exif-item">
                    <span className="exif-label">ISO</span>
                    <span className="exif-value">{selectedItem.metadata.iso}</span>
                  </div>
                  <div className="exif-item">
                    <span className="exif-label">Capture Date</span>
                    <span className="exif-value">{selectedItem.metadata.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="nav-arrow next" onClick={handleNext}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Design Studio Customizer */}
      <div className={`customizer-drawer ${showCustomizer ? 'open' : ''}`}>
        <div className="customizer-header">
          <h3>Design Studio</h3>
          <button className="btn-close-customizer" onClick={() => setShowCustomizer(false)}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="customizer-body">
          <div className="customizer-section">
            <label className="section-title">Color Theme Preset</label>
            <div className="theme-options">
              <button 
                className={`theme-opt ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { setTheme('dark'); setAccentColor(portfolioConfig.defaultTheme.primaryColor); }}
              >
                Dark (Default)
              </button>
              <button 
                className={`theme-opt ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { setTheme('light'); setAccentColor('#aa3bff'); }}
              >
                Minimal Light
              </button>
              <button 
                className={`theme-opt ${theme === 'earthy' ? 'active' : ''}`}
                onClick={() => { setTheme('earthy'); setAccentColor('#d4a373'); }}
              >
                Earthy Tone
              </button>
            </div>
          </div>

          <div className="customizer-section">
            <label className="section-title">Custom Accent Color</label>
            <div className="color-picker-wrapper">
              <input 
                type="color" 
                value={accentColor} 
                onChange={(e) => setAccentColor(e.target.value)} 
                className="color-input"
              />
              <span className="color-hex">{accentColor}</span>
            </div>
            <p className="customizer-tip">
              * The accent color applies dynamically via <code>--accent</code> CSS variables. You can easily modify these in <code>index.css</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="portfolio-footer">
        <div className="footer-container">
          <p>© 2026 {portfolioConfig.photographerName} Photography. All rights reserved.</p>
          <div className="footer-socials">
            <a href={`mailto:${portfolioConfig.email}`}>Email</a>
            <a href={portfolioConfig.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={portfolioConfig.behance} target="_blank" rel="noreferrer">Behance</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Sub-component for individual media cards in the grid
function MediaCard({ item, onClick }) {
  const videoRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (item.type !== 'video' || !videoRef.current) return
    
    if (isHovered) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.log("Auto-play blocked or interrupted:", err))
      }
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isHovered, item.type])

  return (
    <div 
      className={`media-card-item ${item.type}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-media-box">
        {item.type === 'video' ? (
          <div className="video-card-wrapper">
            <video 
              ref={videoRef}
              src={item.src} 
              poster={item.poster}
              muted
              loop
              playsInline
              className="card-asset video-asset"
            />
            {!isHovered && (
              <div className="video-indicator-badge">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>PLAY</span>
              </div>
            )}
          </div>
        ) : (
          <img 
            src={item.src} 
            alt={item.title} 
            loading="lazy"
            className="card-asset image-asset"
          />
        )}
        <div className="card-text-overlay">
          <span className="card-category-tag">{item.category}</span>
          <h3 className="card-title-text">{item.title}</h3>
          <p className="card-view-label">View Details</p>
        </div>
      </div>
    </div>
  )
}

export default App
