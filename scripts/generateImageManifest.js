import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to scan directory and get all image files
function scanDirectory(dirPath) {
  const files = []
  
  try {
    const items = fs.readdirSync(dirPath)
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = scanDirectory(fullPath)
        files.push(...subFiles)
      } else if (stat.isFile()) {
        // Check if it's an image file
        const ext = path.extname(item).toLowerCase()
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
          files.push(item)
        }
      }
    }
  } catch (error) {
    console.warn(`Could not scan directory ${dirPath}:`, error.message)
  }
  
  return files
}

// Function to generate image manifest
function generateImageManifest() {
  const publicDir = path.join(__dirname, '..', 'public')
  const manifest = {}
  
  try {
    const folders = fs.readdirSync(publicDir)
    
    for (const folder of folders) {
      const folderPath = path.join(publicDir, folder)
      const stat = fs.statSync(folderPath)
      
      if (stat.isDirectory()) {
        const images = scanDirectory(folderPath)
        if (images.length > 0) {
          manifest[folder] = images.sort()
        }
      }
    }
  } catch (error) {
    console.error('Error scanning public directory:', error)
    return {}
  }
  
  return manifest
}

// Generate and save manifest
function createManifest() {
  console.log('🔍 Scanning public folder for images...')
  
  const manifest = generateImageManifest()
  
  // Add default category
  manifest['default'] = []
  
  // Create the manifest file
  const manifestContent = `// Auto-generated image manifest
// This file is automatically updated when you run: npm run scan-images

export const IMAGE_MANIFEST = ${JSON.stringify(manifest, null, 2)}

// Image counts for reference
export const IMAGE_COUNTS = {
${Object.entries(manifest).map(([folder, images]) => 
  `  '${folder}': ${images.length}`
).join(',\n')}
}
`
  
  const manifestPath = path.join(__dirname, '..', 'src', 'imageManifest.js')
  fs.writeFileSync(manifestPath, manifestContent)
  
  console.log('✅ Image manifest generated!')
  console.log('📊 Image counts:')
  Object.entries(manifest).forEach(([folder, images]) => {
    if (folder !== 'default') {
      console.log(`   ${folder}: ${images.length} images`)
    }
  })
  
  return manifest
}

// Run the script
createManifest()

export { createManifest, generateImageManifest }
