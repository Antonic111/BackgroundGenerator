import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Zap, Image as ImageIcon, Settings, Play, PaintBucket, Camera, PlaySquare, Upload } from 'lucide-react'
import ImageManager from './ImageManager'

const ControlPanel = ({ settings, onSettingChange, imageAssets, onImagesChange }) => {
  const [activeTab, setActiveTab] = useState('settings')
  const settingGroups = [
    {
      title: 'Layout',
      icon: <ImageIcon size={16} />,
      settings: [
        { key: 'lineCount', label: 'Lines', type: 'range', min: 2, max: 20, step: 1 },
        { key: 'lineSpacing', label: 'Line Spacing', type: 'range', min: 50, max: 200, step: 10 },
        { key: 'imageSpacing', label: 'Image Spacing', type: 'range', min: 50, max: 200, step: 10 }
      ]
    },
    {
      title: 'Images',
      icon: <Camera size={16} />,
      settings: [
        { key: 'imageSize', label: 'Size', type: 'range', min: 20, max: 200, step: 5 },
        { key: 'imageRotation', label: 'Rotation', type: 'range', min: 0, max: 360, step: 1 },
        { key: 'imageTintColor', label: 'Tint Color', type: 'color' },
        { key: 'imageTintIntensity', label: 'Tint Intensity', type: 'range', min: 0, max: 100, step: 1 },
        { key: 'uniformSize', label: 'Uniform Size', type: 'checkbox' }
      ]
    },
        {
          title: 'Animation',
          icon: <PlaySquare size={16} />,
          settings: [
            { key: 'scrollSpeed', label: 'Scroll Speed', type: 'range', min: 0.01, max: 2, step: 0.01 },
            { key: 'animationSpeed', label: 'Animation Speed', type: 'range', min: 0, max: 2, step: 0.1 },
            { key: 'canvasRotation', label: 'Canvas Rotation', type: 'range', min: 0, max: 360, step: 1 }
          ]
        },
        {
          title: 'Appearance',
          icon: <PaintBucket size={16} />,
          settings: [
            { key: 'backgroundType', label: 'Background Type', type: 'select', options: [
              { value: 'solid', label: 'Solid Color' },
              { value: 'linear', label: 'Linear Gradient' },
              { value: 'radial', label: 'Radial Gradient' }
            ]},
            { key: 'backgroundColor', label: 'Background Color', type: 'color' },
            { key: 'gradientColor2', label: 'Gradient Color 2', type: 'color' },
            { key: 'gradientDirection', label: 'Gradient Direction', type: 'select', options: [
              { value: 'top', label: 'Top to Bottom' },
              { value: 'bottom', label: 'Bottom to Top' },
              { value: 'left', label: 'Left to Right' },
              { value: 'right', label: 'Right to Left' },
              { value: 'top-left', label: 'Top-Left to Bottom-Right' },
              { value: 'top-right', label: 'Top-Right to Bottom-Left' },
              { value: 'bottom-left', label: 'Bottom-Left to Top-Right' },
              { value: 'bottom-right', label: 'Bottom-Right to Top-Left' }
            ]},
            { key: 'gradientIntensity', label: 'Gradient Intensity', type: 'range', min: 0, max: 100, step: 1 }
          ]
        }
  ]

  const renderSetting = (setting) => {
    const value = settings[setting.key]
    
    switch (setting.type) {
      case 'range':
        return (
          <div className="setting-group">
            <label>{setting.label}</label>
            <div className="range-container">
              <input
                type="range"
                min={setting.min}
                max={setting.max}
                step={setting.step}
                value={value}
                onChange={(e) => onSettingChange(setting.key, parseFloat(e.target.value))}
                className="range-input"
              />
              <span className="range-value">{value}</span>
            </div>
          </div>
        )
      
      case 'color':
        return (
          <div className="setting-group">
            <label>{setting.label}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => onSettingChange(setting.key, e.target.value)}
              className="color-input"
            />
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onSettingChange(setting.key, e.target.checked)}
                className="checkbox-input"
              />
              {setting.label}
            </label>
          </div>
        )
      
      case 'select':
        return (
          <div className="setting-group">
            <label>{setting.label}</label>
            <select
              value={value}
              onChange={(e) => onSettingChange(setting.key, e.target.value)}
              className="select-input"
            >
              {setting.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div 
      className="control-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="panel-header">
        <h3>Settings</h3>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          Settings
        </button>
        <button 
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          <Upload size={16} />
          Images
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              className="settings-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {settingGroups.map((group, index) => (
                <motion.div
                  key={group.title}
                  className="setting-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="section-header">
                    {group.icon}
                    <h4>{group.title}</h4>
                  </div>
                  
                  <div className="section-content">
                    {group.settings.map(setting => (
                      <div key={setting.key}>
                        {renderSetting(setting)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'images' && (
            <motion.div
              key="images"
              className="images-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ImageManager 
                onImagesChange={onImagesChange}
                currentImages={imageAssets}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ControlPanel
