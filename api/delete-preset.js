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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { presetId } = req.body

    if (!presetId) {
      return res.status(400).json({ error: 'Preset ID is required' })
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
      return res.status(500).json({ error: 'Failed to load presets' })
    }

    // Remove the preset
    const updatedPresets = presets.filter(p => p.id !== presetId)

    // Save updated presets back to file
    try {
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(updatedPresets, null, 2))
    } catch (error) {
      console.error('Error writing presets file:', error)
      return res.status(500).json({ error: 'Failed to delete preset from storage' })
    }

    console.log('Deleting preset:', presetId)

    res.status(200).json({ 
      success: true, 
      message: 'Preset deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting preset:', error)
    res.status(500).json({ error: 'Failed to delete preset' })
  }
}