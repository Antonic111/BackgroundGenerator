import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Folder } from 'lucide-react'
import { IMAGE_MANIFEST } from '../imageManifest.js'

const ImageManager = ({ onImagesChange }) => {
  const [selectedSet, setSelectedSet] = useState(null)
  const [imageSets, setImageSets] = useState([])

  // Load saved selected set from localStorage
  const loadSavedSet = () => {
    try {
      const savedSet = localStorage.getItem('selectedImageSet')
      if (savedSet) {
        return savedSet
      }
    } catch (error) {
      console.warn('Failed to load saved image set:', error)
    }
    return null
  }

  // Save selected set to localStorage
  const saveSelectedSet = (setId) => {
    try {
      localStorage.setItem('selectedImageSet', setId)
    } catch (error) {
      console.warn('Failed to save selected image set:', error)
    }
  }

  // Generate image sets dynamically from manifest
  const generateImageSets = () => {
    const sets = [
      {
        id: 'default',
        name: 'Default',
        folder: 'default',
        thumbnail: null
      }
    ]

    // Add sets for each folder in the manifest
    Object.keys(IMAGE_MANIFEST).forEach(folderName => {
      if (folderName !== 'default' && IMAGE_MANIFEST[folderName].length > 0) {
        sets.push({
          id: folderName.toLowerCase(),
          name: folderName,
          folder: folderName,
          thumbnail: `/${folderName}/${IMAGE_MANIFEST[folderName][0]}` // Use first image as thumbnail
        })
      }
    })

    return sets
  }

  // Initialize image sets dynamically
  useEffect(() => {
    const dynamicSets = generateImageSets()
    console.log('Generated image sets:', dynamicSets)
    setImageSets(dynamicSets)

    // Load saved set if available
    const savedSetId = loadSavedSet()
    if (savedSetId) {
      setSelectedSet(savedSetId)
    }
  }, [])

  // Load images from folder
  const loadImagesFromFolder = async (folderName) => {
    try {
      // Handle default shapes case
      if (folderName === 'default') {
        console.log('Loading default shapes')
        onImagesChange([]) // Empty array means use default shapes
        return []
      }

      // Get images from manifest
      const imageFiles = IMAGE_MANIFEST[folderName] || []
      
      if (imageFiles.length === 0) {
        console.warn(`No images found for folder: ${folderName}`)
        onImagesChange([])
        return []
      }
      
      // Load actual Image objects
      const imagePromises = imageFiles.map(async (filename, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            resolve({
              id: `${folderName}-${index}`,
              name: filename,
              url: `/${folderName}/${filename}`,
              folder: folderName,
              image: img // Add the actual loaded Image object
            })
          }
          img.onerror = () => {
            console.error('Failed to load image:', `/${folderName}/${filename}`)
            reject(new Error(`Failed to load ${filename}`))
          }
          img.src = `/${folderName}/${filename}`
        })
      })

      const images = await Promise.all(imagePromises)
      console.log('Loaded images for', folderName, ':', images.length)
      return images
    } catch (error) {
      console.error('Error loading images from folder:', error)
      return []
    }
  }

  // Load images from a specific set
  const loadImageSet = async (setId) => {
    console.log('ImageManager: loadImageSet called with setId:', setId)
    const imageSet = imageSets.find(set => set.id === setId)
    if (!imageSet) {
      console.error('ImageManager: No image set found for ID:', setId)
      return
    }

    console.log('ImageManager: Found image set:', imageSet)
    const images = await loadImagesFromFolder(imageSet.folder)
    console.log('ImageManager: Loading images for set:', imageSet.name, 'Images:', images.length)
    setSelectedSet(setId)
    saveSelectedSet(setId) // Save the selection
    onImagesChange(images)
  }

  return (
    <motion.div 
      className="image-manager"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="image-manager-header">
        <h3>Image Sets</h3>
      </div>

      {/* Image Set Selection */}
      <div className="image-sets-section">
        <div className="sets-grid">
          {imageSets.map((set) => (
            <motion.div
              key={set.id}
              className={`set-card ${selectedSet === set.id ? 'active' : ''}`}
              onClick={() => loadImageSet(set.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {set.thumbnail ? (
                <img src={set.thumbnail} alt={set.name} className="set-thumbnail" />
              ) : (
                <div className="default-shape-icon">
                  <div className="shape-circle"></div>
                  <div className="shape-square"></div>
                  <div className="shape-triangle"></div>
                </div>
              )}
              <span>{set.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ImageManager