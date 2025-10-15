import { kv } from '@vercel/kv'

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

    // Load existing presets from KV storage
    let presets = []
    try {
      const existingPresets = await kv.get('background-generator-presets')
      if (existingPresets) {
        presets = existingPresets
      }
    } catch (error) {
      console.error('Error reading presets from KV:', error)
      return res.status(500).json({ error: 'Failed to load presets' })
    }

    // Remove the preset
    const updatedPresets = presets.filter(p => p.id !== presetId)

    // Save updated presets back to KV storage
    try {
      await kv.set('background-generator-presets', updatedPresets)
    } catch (error) {
      console.error('Error writing presets to KV:', error)
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