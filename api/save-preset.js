// Simple in-memory storage for presets (resets on server restart)
let presets = []

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

    // Add new preset to in-memory storage
    presets.push(preset)

    console.log('Saving preset:', preset)
    console.log('Total presets:', presets.length)

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