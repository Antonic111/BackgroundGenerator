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

  if (req.method === 'GET') {
    try {
      res.status(200).json({ 
        success: true, 
        presets 
      })
    } catch (error) {
      console.error('Error loading presets:', error)
      res.status(500).json({ error: 'Failed to load presets' })
    }
  } else if (req.method === 'POST') {
    try {
      const { presetId } = req.body
      if (!presetId) {
        return res.status(400).json({ error: 'Preset ID is required' })
      }

      // Find the preset
      const preset = presets.find(p => p.id === presetId)
      if (!preset) {
        return res.status(404).json({ error: 'Preset not found' })
      }

      console.log('Loading preset:', presetId)
      res.status(200).json({ 
        success: true, 
        preset,
        message: 'Preset loaded successfully' 
      })
    } catch (error) {
      console.error('Error loading preset:', error)
      res.status(500).json({ error: 'Failed to load preset' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}