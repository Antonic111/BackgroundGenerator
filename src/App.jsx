import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Download, 
  Eye,
  EyeOff,
  Wallpaper,
  Save,
  Upload,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'
import './App.css'
import { IMAGE_MANIFEST } from './imageManifest.js'

import BackgroundCanvas from './components/BackgroundCanvas'
import ControlPanel from './components/ControlPanel'
import Presets from './components/Presets'

// Default settings
const DEFAULT_SETTINGS = {
  imageCount: 20,
  imageSize: 50,
  scrollSpeed: 0.5,
  lineCount: 4,
  lineSpacing: 100,
  imageSpacing: 80,
  backgroundColor: '#0a0a0a',
  imageTintColor: '#ffffff',
  imageRotation: 0,
  imageTintIntensity: 0,
  uniformSize: false,
  animationSpeed: 1.0,
  canvasRotation: 0,
  backgroundType: 'solid',
  gradientColor2: '#000000',
  gradientDirection: 'top',
  gradientIntensity: 50
}

function App() {
  // Load settings from localStorage or use defaults
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('obsBackgroundGeneratorSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
    return DEFAULT_SETTINGS
  }

  // State management
  const [settings, setSettings] = useState(loadSettings)
  const [imageAssets, setImageAssets] = useState([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [isOBSMode, setIsOBSMode] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [loadModalText, setLoadModalText] = useState('')
  const [saveFeedback, setSaveFeedback] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(() => {
    try {
      const saved = localStorage.getItem('obsBackgroundGeneratorFullscreen')
      return saved ? JSON.parse(saved) : false
    } catch (error) {
      console.error('Failed to load fullscreen state:', error)
      return false
    }
  })
  const [showPresets, setShowPresets] = useState(false)
  
  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('obsBackgroundGeneratorSettings', JSON.stringify(newSettings))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }
  
  // Refs
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('obsBackgroundSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.warn('Failed to load saved settings:', error)
      }
    }
    
    // Load saved image set
    const savedImageSet = localStorage.getItem('selectedImageSet')
    if (savedImageSet) {
      loadImageSet(savedImageSet)
    }
    
    // Check if we're in OBS mode (URL parameters present)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('obsMode')) {
      setIsOBSMode(true)
      setShowSettings(false)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      localStorage.setItem('obsBackgroundSettings', JSON.stringify(settings))
    }
  }, [settings])

  // Animation loop
  const animate = useCallback((currentTime) => {
    if (!isAnimating || !canvasRef.current) return

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // Update canvas animation here
    // This will be handled by the BackgroundCanvas component

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating])

  // Start/stop animation
  useEffect(() => {
    if (isAnimating) {
      lastTimeRef.current = performance.now()
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, animate])


  // Handle settings changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      }
      // Save to localStorage
      saveSettings(newSettings)
      return newSettings
    })
  }

  // Handle image loading
  const handleImagesLoaded = (images) => {
    console.log('App received images:', images.length, images)
    setImageAssets(images)
  }

  // Load image set from localStorage
  const loadImageSet = async (setId) => {
    console.log('App: loadImageSet called with setId:', setId)
    const imageSets = {
      'default': { folder: 'default' },
      'balls': { folder: 'Balls' },
      'gooner': { folder: 'Gooner' },
      'pokemon': { folder: 'Pokemon' },
      'zelda': { folder: 'Zelda' }
    }

    const imageSet = imageSets[setId]
    if (!imageSet) {
      console.error('App: No image set found for ID:', setId)
      return
    }

    console.log('App: Found image set:', imageSet)

    // Handle default shapes case
    if (imageSet.folder === 'default') {
      console.log('Loading default shapes')
      setImageAssets([]) // Empty array means use default shapes
      return
    }

    try {
      // Get images from manifest
      const imageFiles = IMAGE_MANIFEST[imageSet.folder] || []
      
      if (imageFiles.length === 0) {
        console.warn(`No images found for folder: ${imageSet.folder}`)
        setImageAssets([])
        return
      }
      
      // Load actual Image objects
      const imagePromises = imageFiles.map(async (filename, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            resolve({
              id: `${imageSet.folder}-${index}`,
              name: filename,
              url: `/${imageSet.folder}/${filename}`,
              folder: imageSet.folder,
              image: img
            })
          }
          img.onerror = () => {
            console.error('Failed to load image:', `/${imageSet.folder}/${filename}`)
            reject(new Error(`Failed to load ${filename}`))
          }
          img.src = `/${imageSet.folder}/${filename}`
        })
      })

      const images = await Promise.all(imagePromises)
      console.log('Loaded images for', imageSet.folder, ':', images.length)
      setImageAssets(images)
    } catch (error) {
      console.error('Error loading images from folder:', error)
      setImageAssets([])
    }
  }

  // Export settings for OBS
  const exportForOBS = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('obsMode', 'true')
    
    Object.keys(settings).forEach(key => {
      url.searchParams.set(key, settings[key])
    })

    navigator.clipboard.writeText(url.toString())
  }

  // Save settings to clipboard
  const saveSettingsToClipboard = () => {
    const settingsData = {
      settings: settings,
      selectedImageSet: localStorage.getItem('selectedImageSet'),
      timestamp: new Date().toISOString()
    }
    
    const settingsText = JSON.stringify(settingsData, null, 2)
    navigator.clipboard.writeText(settingsText)
    console.log('Settings saved to clipboard:', settingsData)
    
    // Show feedback
    setSaveFeedback(true)
    setTimeout(() => setSaveFeedback(false), 2000)
  }

  // Load settings from modal
  const loadSettingsFromModal = () => {
    try {
      const settingsData = JSON.parse(loadModalText)
      
      if (settingsData.settings) {
        setSettings(settingsData.settings)
        console.log('Settings loaded from modal:', settingsData.settings)
      }
      
      if (settingsData.selectedImageSet) {
        localStorage.setItem('selectedImageSet', settingsData.selectedImageSet)
        loadImageSet(settingsData.selectedImageSet)
        console.log('Image set loaded:', settingsData.selectedImageSet)
      }
      
      // Close modal and clear text
      setShowLoadModal(false)
      setLoadModalText('')
    } catch (error) {
      console.error('Failed to load settings from modal:', error)
      alert('Invalid JSON format. Please check your settings data.')
    }
  }

  // Open load modal
  const openLoadModal = () => {
    setShowLoadModal(true)
    setLoadModalText('')
  }

  // Load preset function
  const loadPreset = (presetSettings, presetImageSet) => {
    setSettings(presetSettings)
    if (presetImageSet) {
      localStorage.setItem('selectedImageSet', presetImageSet)
      loadImageSet(presetImageSet)
    }
  }

  // Canvas overlay functions
  const toggleCanvasOverlay = () => {
    const newFullscreenState = !isFullscreen
    setIsFullscreen(newFullscreenState)
    
    // Save fullscreen state to localStorage
    try {
      localStorage.setItem('obsBackgroundGeneratorFullscreen', JSON.stringify(newFullscreenState))
    } catch (error) {
      console.error('Failed to save fullscreen state:', error)
    }
  }

  // Handle ESC key to exit canvas overlay
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
        
        // Save fullscreen state to localStorage
        try {
          localStorage.setItem('obsBackgroundGeneratorFullscreen', JSON.stringify(false))
        } catch (error) {
          console.error('Failed to save fullscreen state:', error)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])


  return (
    <div className="app">
      {/* OBS Mode - Full screen canvas only */}
      {isOBSMode ? (
        <div className="obs-mode">
          <BackgroundCanvas
            ref={canvasRef}
            settings={settings}
            imageAssets={imageAssets}
            isAnimating={isAnimating}
            isOBSMode={true}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <motion.header 
            className="header"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="header-left">
              <h1><Wallpaper size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Background Generator</h1>
            </div>
            
            <div className="header-controls">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPresets(true)}
                title="Manage presets"
              >
                <Settings size={16} />
                Presets
              </button>
              
              <button 
                className={`btn btn-secondary ${saveFeedback ? 'btn-success' : ''}`}
                onClick={saveSettingsToClipboard}
                title="Save settings to clipboard"
              >
                <Save size={16} />
                {saveFeedback ? 'Copied!' : 'Save'}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={openLoadModal}
                title="Load settings from text"
              >
                <Upload size={16} />
                Load
              </button>
            </div>
          </motion.header>

          {/* Main Content */}
          <div className="main-content">
            {/* Control Panel - Always visible */}
            <div className="control-panel">
              <ControlPanel
                settings={settings}
                onSettingChange={handleSettingChange}
                imageAssets={imageAssets}
                onImagesChange={handleImagesLoaded}
              />
            </div>

            {/* Canvas Preview Area */}
            <div className="canvas-preview-area">
              <div className="canvas-container">
                <BackgroundCanvas
                  ref={canvasRef}
                  settings={settings}
                  imageAssets={imageAssets}
                  isAnimating={isAnimating}
                  isOBSMode={false}
                />
                
                {/* Canvas Overlay Button */}
                <button 
                  className="fullscreen-button"
                  onClick={toggleCanvasOverlay}
                  title={isFullscreen ? "Exit canvas overlay (ESC)" : "Enter canvas overlay"}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Canvas Overlay Mode - Full screen canvas covering everything */}
      {isFullscreen && (
        <motion.div
          className="canvas-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <BackgroundCanvas
            ref={canvasRef}
            settings={settings}
            imageAssets={imageAssets}
            isAnimating={isAnimating}
            isOBSMode={true}
          />
        </motion.div>
      )}

      {/* Load Settings Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              className="modal-content load-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Load Settings</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowLoadModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <p>Paste your saved settings JSON below:</p>
                <textarea
                  className="settings-textarea"
                  value={loadModalText}
                  onChange={(e) => setLoadModalText(e.target.value)}
                  placeholder="Paste your settings JSON here..."
                  rows={10}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowLoadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={loadSettingsFromModal}
                  disabled={!loadModalText.trim()}
                >
                  Load Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presets Modal */}
      <AnimatePresence>
        {showPresets && (
          <Presets
            settings={settings}
            selectedImageSet={localStorage.getItem('selectedImageSet')}
            onLoadPreset={loadPreset}
            onClose={() => setShowPresets(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
