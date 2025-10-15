import fs from 'fs'
import path from 'path'

const PRESETS_FILE = path.join(process.cwd(), 'presets.json')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, settings, selectedImageSet } = req.body

    if (!name || !settings) {
      return res.status(400).json({ error: 'Name and settings are required' })
    }

    const preset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: '',
      settings,
      selectedImageSet: selectedImageSet || 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Load existing presets
    let presets = []
    try {
      if (fs.existsSync(PRESETS_FILE)) {
        const data = fs.readFileSync(PRESETS_FILE, 'utf8')
        presets = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error reading presets file:', error)
    }

    // Add new preset
    presets.push(preset)

    // Save presets back to file
    try {
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2))
    } catch (error) {
      console.error('Error writing presets file:', error)
      return res.status(500).json({ error: 'Failed to save preset to storage' })
    }

    console.log('Saving preset:', preset)

    res.status(200).json({ 
      success: true, 
      preset,
      message: 'Preset saved successfully' 
    })

  } catch (error) {
    console.error('Error saving preset:', error)
    res.status(500).json({ error: 'Failed to save preset' })
  }
}