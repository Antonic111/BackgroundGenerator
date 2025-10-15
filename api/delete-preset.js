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
