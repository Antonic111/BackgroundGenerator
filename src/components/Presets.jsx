import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Trash2, 
  Play, 
  X,
  Plus,
  Settings
} from 'lucide-react'
import './Presets.css'

const Presets = ({ settings, selectedImageSet, onLoadPreset, onClose }) => {
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [saving, setSaving] = useState(false)

  // Load presets on component mount
  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setLoading(true)
    try {
      // For development, use mock data
      // In production with Vercel, this will use the real API
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isDevelopment) {
        // Load presets from localStorage in development
        const savedPresets = localStorage.getItem('backgroundGeneratorPresets')
        const mockPresets = savedPresets ? JSON.parse(savedPresets) : []
        
        setPresets(mockPresets)
      } else {
        // Production API call
        const response = await fetch('/api/load-preset')
        const data = await response.json()
        
        if (data.success) {
          setPresets(data.presets)
        } else {
          console.error('Failed to load presets:', data.error)
        }
      }
    } catch (error) {
      console.error('Error loading presets:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreset = async () => {
    if (!newPresetName.trim()) return

    setSaving(true)
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isDevelopment) {
        // Mock save for development
        const newPreset = {
          id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: newPresetName.trim(),
          description: '',
          settings: settings,
          selectedImageSet: selectedImageSet,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const updatedPresets = [...presets, newPreset]
        setPresets(updatedPresets)
        
        // Save to localStorage
        localStorage.setItem('backgroundGeneratorPresets', JSON.stringify(updatedPresets))
        
        setShowSaveModal(false)
        setNewPresetName('')
      } else {
        // Production API call
        const response = await fetch('/api/save-preset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newPresetName.trim(),
            description: '',
            settings: settings,
            selectedImageSet: selectedImageSet
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setPresets(prev => [...prev, data.preset])
          setShowSaveModal(false)
          setNewPresetName('')
        } else {
          console.error('Failed to save preset:', data.error)
          alert('Failed to save preset: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Error saving preset:', error)
      alert('Error saving preset: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const loadPreset = async (preset) => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isDevelopment) {
        // Mock load for development - just load the preset directly
        onLoadPreset(preset.settings, preset.selectedImageSet)
      } else {
        // Production API call
        const response = await fetch('/api/load-preset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            presetId: preset.id
          })
        })

        const data = await response.json()
        
        if (data.success) {
          // Load the preset settings
          onLoadPreset(preset.settings, preset.selectedImageSet)
        } else {
          console.error('Failed to load preset:', data.error)
          alert('Failed to load preset: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Error loading preset:', error)
      alert('Error loading preset: ' + error.message)
    }
  }

  const deletePreset = async (presetId) => {
    if (!confirm('Are you sure you want to delete this preset?')) return

    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isDevelopment) {
        // Mock delete for development
        const updatedPresets = presets.filter(p => p.id !== presetId)
        setPresets(updatedPresets)
        
        // Update localStorage
        localStorage.setItem('backgroundGeneratorPresets', JSON.stringify(updatedPresets))
      } else {
        // Production API call
        const response = await fetch('/api/delete-preset', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            presetId: presetId
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setPresets(prev => prev.filter(p => p.id !== presetId))
        } else {
          console.error('Failed to delete preset:', data.error)
          alert('Failed to delete preset: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Error deleting preset:', error)
      alert('Error deleting preset: ' + error.message)
    }
  }

  return (
    <div className="presets-overlay">
      <motion.div
        className="presets-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="presets-header">
          <h2>Presets</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="presets-content">
          <div className="presets-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowSaveModal(true)}
            >
              <Plus size={16} />
              Save Current Settings
            </button>
          </div>

          <div className="presets-list">
            {loading ? (
              <div className="loading">Loading presets...</div>
            ) : presets.length === 0 ? (
              <div className="empty-state">
                <Settings size={48} />
                <p>No presets saved yet</p>
                <p>Save your current settings to create your first preset!</p>
              </div>
            ) : (
              presets.map((preset) => (
                <motion.div
                  key={preset.id}
                  className="preset-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="preset-info">
                    <h3>{preset.name}</h3>
                    <div className="preset-meta">
                      <span>Image Set: {preset.selectedImageSet}</span>
                      <span>Created: {new Date(preset.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="preset-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => loadPreset(preset)}
                      title="Load this preset"
                    >
                      <Play size={16} />
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => deletePreset(preset.id)}
                      title="Delete this preset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className="modal-content save-preset-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Save Preset</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowSaveModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="preset-name">Preset Name</label>
                  <input
                    id="preset-name"
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Enter preset name..."
                    maxLength={50}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={savePreset}
                  disabled={!newPresetName.trim() || saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Preset'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Presets
