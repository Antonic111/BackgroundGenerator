import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'

const BackgroundCanvas = forwardRef(({ settings, imageAssets, isAnimating, isOBSMode = false }, ref) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const particlesRef = useRef([])

  useImperativeHandle(ref, () => ({
    canvas: canvasRef.current,
    getContext: () => canvasRef.current?.getContext('2d')
  }))

  // Function to generate random colors for default shapes
  const getRandomColor = () => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', 
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe', '#fd79a8',
      '#fdcb6e', '#e17055', '#00b894', '#00cec9', '#74b9ff'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getGradientCoords = (direction, width, height) => {
    const centerX = width / 2
    const centerY = height / 2
    
    switch (direction) {
      case 'top':
        return { x0: centerX, y0: 0, x1: centerX, y1: height }
      case 'bottom':
        return { x0: centerX, y0: height, x1: centerX, y1: 0 }
      case 'left':
        return { x0: 0, y0: centerY, x1: width, y1: centerY }
      case 'right':
        return { x0: width, y0: centerY, x1: 0, y1: centerY }
      case 'top-left':
        return { x0: 0, y0: 0, x1: width, y1: height }
      case 'top-right':
        return { x0: width, y0: 0, x1: 0, y1: height }
      case 'bottom-left':
        return { x0: 0, y0: height, x1: width, y1: 0 }
      case 'bottom-right':
        return { x0: width, y0: height, x1: 0, y1: 0 }
      default:
        return { x0: centerX, y0: 0, x1: centerX, y1: height }
    }
  }

  // Cache for tinted images
  const tintedImageCache = useRef(new Map())
  const lastTintSettings = useRef({ color: '', intensity: 0 })

  const getTintedImage = (originalImage, size) => {
    // Check if tint settings changed
    const tintKey = `${settings.imageTintColor}_${settings.imageTintIntensity}`
    const cacheKey = `${originalImage.src}_${size}_${tintKey}`
    
    // Return cached version if available
    if (tintedImageCache.current.has(cacheKey)) {
      return tintedImageCache.current.get(cacheKey)
    }
    
    // Create new tinted image
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = size
    tempCanvas.height = size
    
    // Draw the original image
    tempCtx.drawImage(originalImage, 0, 0, size, size)
    
    if (settings.imageTintIntensity > 0) {
      if (settings.imageTintIntensity >= 100) {
        // At 100%, create a solid color silhouette
        tempCtx.globalCompositeOperation = 'source-in'
        tempCtx.fillStyle = settings.imageTintColor
        tempCtx.fillRect(0, 0, size, size)
      } else {
        // For partial tinting, blend the original with the tint color
        tempCtx.globalCompositeOperation = 'source-atop'
        tempCtx.fillStyle = settings.imageTintColor
        tempCtx.globalAlpha = settings.imageTintIntensity / 100
        tempCtx.fillRect(0, 0, size, size)
      }
    }
    
    // Cache the result
    const tintedImage = new Image()
    tintedImage.src = tempCanvas.toDataURL()
    tintedImageCache.current.set(cacheKey, tintedImage)
    
    return tintedImage
  }

  // Function to calculate line positions (simplified like the working HTML)
  const getLineY = (lineIndex, totalLines, lineSpacing, canvasHeight) => {
    const centerY = canvasHeight / 2
    const startY = centerY - ((totalLines - 1) * lineSpacing) / 2
    return startY + (lineIndex * lineSpacing)
  }

  // Function to draw default shapes
  const drawShape = (ctx, particle) => {
    const halfSize = particle.size / 2
    
    switch (particle.shapeType) {
      case 0: // Circle
        ctx.beginPath()
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2)
        ctx.fill()
        break
      
      case 1: // Square
        ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size)
        break
      
      case 2: // Triangle
        ctx.beginPath()
        ctx.moveTo(0, -halfSize)
        ctx.lineTo(-halfSize, halfSize)
        ctx.lineTo(halfSize, halfSize)
        ctx.closePath()
        ctx.fill()
        break
      
      case 3: // Diamond
        ctx.beginPath()
        ctx.moveTo(0, -halfSize)
        ctx.lineTo(halfSize, 0)
        ctx.lineTo(0, halfSize)
        ctx.lineTo(-halfSize, 0)
        ctx.closePath()
        ctx.fill()
        break
    }
  }

  // Initialize particles only when imageAssets change
  useEffect(() => {
    console.log('BackgroundCanvas: imageAssets changed, creating particles. Count:', imageAssets.length)
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size with high DPI support
    const devicePixelRatio = window.devicePixelRatio || 1
    
    if (isOBSMode) {
      // OBS mode: fill the entire viewport for overlay mode
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      canvas.width = viewportWidth * devicePixelRatio
      canvas.height = viewportHeight * devicePixelRatio
      canvas.style.width = viewportWidth + 'px'
      canvas.style.height = viewportHeight + 'px'
    } else {
      // Preview mode: fill container with high DPI, accounting for padding
      const container = canvas.parentElement
      const containerRect = container.getBoundingClientRect()
      const padding = 50 // Match the CSS padding
      const displayWidth = Math.max(containerRect.width - (padding * 2), 200) // Min width of 200px
      const displayHeight = Math.max(containerRect.height - (padding * 2), 150) // Min height of 150px
      
      canvas.width = displayWidth * devicePixelRatio
      canvas.height = displayHeight * devicePixelRatio
      canvas.style.width = displayWidth + 'px'
      canvas.style.height = displayHeight + 'px'
    }
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio)

    // Create particles
    particlesRef.current = []
    
    // Create scrolling lines with alternating directions, starting from center (like the working HTML)
    const lineCount = settings.lineCount
    const lineSpacing = settings.lineSpacing
    const imageSpacing = settings.imageSpacing
    const centerY = canvas.height / 2
    
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      // Calculate Y position: simple sequential spacing from center (like working HTML)
      const startY = centerY - ((lineCount - 1) * lineSpacing) / 2
      const y = startY + (lineIndex * lineSpacing)
      
      // Direction should alternate: even lines left, odd lines right (like working HTML)
      const direction = lineIndex % 2 === 0 ? -1 : 1
      const speed = direction // Base speed, will be multiplied by scrollSpeed in animation
      
      // Create images for this line that will scroll continuously (like working HTML)
      const imagesPerLine = Math.ceil(canvas.width / imageSpacing) + 3 // Extra images for seamless scrolling
      
      for (let i = 0; i < imagesPerLine; i++) {
        const imageData = imageAssets.length > 0 ? imageAssets[Math.floor(Math.random() * imageAssets.length)] : null
        const size = settings.uniformSize ? settings.imageSize : Math.random() * (settings.imageSize * 0.5) + (settings.imageSize * 0.5)
        const alpha = Math.random() * 0.4 + 0.6
        
        // Start images distributed across the screen with proper spacing (like working HTML)
        const startX = (i * imageSpacing) + (Math.random() * 20 - 10) // Reduced randomness for better spacing
        
        particlesRef.current.push({
          image: imageData,
          x: startX,
          y: y,
          size: size,
          speed: speed,
          dynamicRotation: 0, // Separate dynamic rotation from static image rotation
          rotationSpeed: (Math.random() - 0.5) * 3,
          alpha: alpha,
          line: lineIndex,
          shapeType: Math.floor(Math.random() * 4),
          color: getRandomColor() // Add random color for default shapes
        })
      }
    }
  }, [imageAssets, isOBSMode])

  // Handle particle count changes dynamically
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const lineCount = settings.lineCount
    const lineSpacing = settings.lineSpacing
    const imageSpacing = settings.imageSpacing
    const centerY = canvas.height / 2
    
    // Recreate all particles when settings change (like the working HTML)
    particlesRef.current = []
    
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      // Calculate Y position: simple sequential spacing from center
      const startY = centerY - ((lineCount - 1) * lineSpacing) / 2
      const y = startY + (lineIndex * lineSpacing)
      
      // Direction should alternate: even lines left, odd lines right
      const direction = lineIndex % 2 === 0 ? -1 : 1
      const speed = direction // Base speed, will be multiplied by scrollSpeed in animation
      
      // Create images for this line that will scroll continuously
      const imagesPerLine = Math.ceil(canvas.width / imageSpacing) + 3
      
      for (let i = 0; i < imagesPerLine; i++) {
        const imageData = imageAssets.length > 0 ? imageAssets[Math.floor(Math.random() * imageAssets.length)] : null
        const size = settings.uniformSize ? settings.imageSize : Math.random() * (settings.imageSize * 0.5) + (settings.imageSize * 0.5)
        const alpha = Math.random() * 0.4 + 0.6
        
        // Start images distributed across the screen with proper spacing
        const startX = (i * imageSpacing) + (Math.random() * 20 - 10)
        
        particlesRef.current.push({
          image: imageData,
          x: startX,
          y: y,
          size: size,
          speed: speed,
          dynamicRotation: 0, // Separate dynamic rotation from static image rotation
          rotationSpeed: (Math.random() - 0.5) * 3,
          alpha: alpha,
          line: lineIndex,
          shapeType: Math.floor(Math.random() * 4),
          color: getRandomColor() // Add random color for default shapes
        })
      }
    }
  }, [settings.lineCount, settings.lineSpacing, settings.imageSpacing, settings.imageSize, settings.scrollSpeed, settings.uniformSize, settings.canvasRotation])

  // Handle animation speed changes - reset dynamic rotation when speed becomes 0
  useEffect(() => {
    if (settings.animationSpeed === 0) {
      // Reset all particles to upright position when animation speed is 0
      particlesRef.current.forEach(particle => {
        particle.dynamicRotation = 0
      })
    }
  }, [settings.animationSpeed])

  // Clear tint cache when tint settings change
  useEffect(() => {
    if (lastTintSettings.current.color !== settings.imageTintColor || 
        lastTintSettings.current.intensity !== settings.imageTintIntensity) {
      tintedImageCache.current.clear()
      lastTintSettings.current = { 
        color: settings.imageTintColor, 
        intensity: settings.imageTintIntensity 
      }
    }
  }, [settings.imageTintColor, settings.imageTintIntensity])

  // Handle window resize to update canvas size
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const devicePixelRatio = window.devicePixelRatio || 1
      
      if (isOBSMode) {
        // OBS mode: fill the entire viewport for overlay mode
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        canvas.width = viewportWidth * devicePixelRatio
        canvas.height = viewportHeight * devicePixelRatio
        canvas.style.width = viewportWidth + 'px'
        canvas.style.height = viewportHeight + 'px'
      } else {
        // Preview mode: fill container with high DPI, accounting for padding
        const container = canvas.parentElement
        const containerRect = container.getBoundingClientRect()
        const padding = 50 // Match the CSS padding
        const displayWidth = Math.max(containerRect.width - (padding * 2), 200) // Min width of 200px
        const displayHeight = Math.max(containerRect.height - (padding * 2), 150) // Min height of 150px
        
        canvas.width = displayWidth * devicePixelRatio
        canvas.height = displayHeight * devicePixelRatio
        canvas.style.width = displayWidth + 'px'
        canvas.style.height = displayHeight + 'px'
      }
      
      // Scale the drawing context
      ctx.scale(devicePixelRatio, devicePixelRatio)
      
      // Regenerate particles for new canvas size to maintain proper line layout
      particlesRef.current = []
      
      // Create scrolling lines with alternating directions, starting from center
      const lineCount = settings.lineCount
      const lineSpacing = settings.lineSpacing
      const imageSpacing = settings.imageSpacing
      
      // Use appropriate canvas dimensions for line calculations
      const canvasWidth = isOBSMode ? window.innerWidth : canvas.style.width.replace('px', '')
      const canvasHeight = isOBSMode ? window.innerHeight : canvas.style.height.replace('px', '')
      
      for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
        const y = getLineY(lineIndex, lineCount, lineSpacing, canvasHeight)
        
        // Direction should alternate: even lines left, odd lines right
        const direction = lineIndex % 2 === 0 ? -1 : 1
        const speed = direction
        
        // Create images for this line that will scroll continuously
        const imagesPerLine = Math.ceil(canvasWidth / imageSpacing) + 3
        
        for (let i = 0; i < imagesPerLine; i++) {
          const imageData = imageAssets.length > 0 ? imageAssets[Math.floor(Math.random() * imageAssets.length)] : null
          const size = settings.uniformSize ? settings.imageSize : Math.random() * (settings.imageSize * 0.5) + (settings.imageSize * 0.5)
          const alpha = Math.random() * 0.4 + 0.6
          
          // Start images distributed across the screen with proper spacing
          const startX = (i * imageSpacing) + (Math.random() * 20 - 10)
          
          particlesRef.current.push({
            image: imageData,
            x: startX,
            y: y,
            size: size,
            speed: speed,
            dynamicRotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 3,
            alpha: alpha,
            line: lineIndex,
            shapeType: Math.floor(Math.random() * 4),
            color: getRandomColor()
          })
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOBSMode, settings.lineCount, settings.lineSpacing, settings.imageSpacing, settings.imageSize, settings.uniformSize, imageAssets])

  // Animation loop
  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background based on type
      if (settings.backgroundType === 'solid') {
        ctx.fillStyle = settings.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (settings.backgroundType === 'linear') {
        const coords = getGradientCoords(settings.gradientDirection, canvas.width, canvas.height)
        const gradient = ctx.createLinearGradient(coords.x0, coords.y0, coords.x1, coords.y1)
        gradient.addColorStop(0, settings.backgroundColor)
        gradient.addColorStop(Math.min(settings.gradientIntensity / 100, 1), settings.gradientColor2)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (settings.backgroundType === 'radial') {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.max(canvas.width, canvas.height) / 2
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        gradient.addColorStop(0, settings.backgroundColor)
        gradient.addColorStop(Math.min(settings.gradientIntensity / 100, 1), settings.gradientColor2)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Save canvas state for rotation
      ctx.save()
      
      // Apply canvas rotation if enabled
      if (settings.canvasRotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((settings.canvasRotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update dynamic rotation with animation speed (0 = no dynamic rotation)
        if (settings.animationSpeed > 0) {
          particle.dynamicRotation += particle.rotationSpeed * deltaTime * 0.01 * settings.animationSpeed
        }
        // When animation speed is 0, dynamic rotation stays at 0
        
        // Update position with scroll speed
        particle.x += particle.speed * deltaTime * 0.1 * settings.scrollSpeed
        
        // Wrap around screen with proper spacing, accounting for canvas rotation
        const imageSpacing = settings.imageSpacing
        
        // Calculate effective boundaries when canvas is rotated
        let wrapLeftBoundary = -particle.size
        let wrapRightBoundary = canvas.width + particle.size
        
        if (settings.canvasRotation !== 0) {
          // When rotated, we need to account for the rotation angle
          const rotationRad = (settings.canvasRotation * Math.PI) / 180
          const cos = Math.abs(Math.cos(rotationRad))
          const sin = Math.abs(Math.sin(rotationRad))
          
          // Calculate how much extra space we need for rotation
          const extraWidth = (canvas.width * sin + canvas.height * cos - canvas.width) / 2
          const extraHeight = (canvas.width * cos + canvas.height * sin - canvas.height) / 2
          
          // Adjust boundaries to ensure particles don't disappear prematurely
          wrapLeftBoundary = -particle.size - extraWidth
          wrapRightBoundary = canvas.width + particle.size + extraWidth
        }
        
        if (particle.speed > 0 && particle.x > wrapRightBoundary) {
          // Find the leftmost particle in this line to reset to
          const lineParticles = particlesRef.current.filter(p => p.line === particle.line)
          const leftmostX = Math.min(...lineParticles.map(p => p.x))
          particle.x = leftmostX - imageSpacing
          // Keep the same image - don't randomize when wrapping
        } else if (particle.speed < 0 && particle.x < wrapLeftBoundary) {
          // Find the rightmost particle in this line to reset to
          const lineParticles = particlesRef.current.filter(p => p.line === particle.line)
          const rightmostX = Math.max(...lineParticles.map(p => p.x))
          particle.x = rightmostX + imageSpacing
          // Keep the same image - don't randomize when wrapping
        }

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.alpha
        ctx.translate(particle.x, particle.y)
        
        if (particle.image && particle.image.image) {
          // Draw image with rotation
          ctx.rotate((particle.dynamicRotation + settings.imageRotation) * Math.PI / 180)
          
          // Get the appropriate image (tinted or original)
          const imageToDraw = settings.imageTintIntensity > 0 ? 
            getTintedImage(particle.image.image, particle.size) : 
            particle.image.image
          
          // Draw the image
          ctx.drawImage(
            imageToDraw,
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          )
        } else {
          // Draw default shape with tinting support
          ctx.rotate((particle.dynamicRotation + settings.imageRotation) * Math.PI / 180)
          
          if (settings.imageTintIntensity > 0) {
            // For default shapes, blend colors directly instead of using composite operations
            const originalColor = particle.color || '#ffffff'
            const tintColor = settings.imageTintColor
            
            // Parse original color
            const origR = parseInt(originalColor.slice(1, 3), 16)
            const origG = parseInt(originalColor.slice(3, 5), 16)
            const origB = parseInt(originalColor.slice(5, 7), 16)
            
            // Parse tint color
            const tintR = parseInt(tintColor.slice(1, 3), 16)
            const tintG = parseInt(tintColor.slice(3, 5), 16)
            const tintB = parseInt(tintColor.slice(5, 7), 16)
            
            // Blend colors based on intensity
            const intensity = settings.imageTintIntensity / 100
            const blendedR = Math.round(origR * (1 - intensity) + tintR * intensity)
            const blendedG = Math.round(origG * (1 - intensity) + tintG * intensity)
            const blendedB = Math.round(origB * (1 - intensity) + tintB * intensity)
            
            // Convert back to hex
            const blendedColor = `#${blendedR.toString(16).padStart(2, '0')}${blendedG.toString(16).padStart(2, '0')}${blendedB.toString(16).padStart(2, '0')}`
            
            // Draw shape with blended color
            ctx.fillStyle = blendedColor
            drawShape(ctx, { ...particle, size: particle.size })
          } else {
            // No tinting, draw shape normally
            ctx.fillStyle = particle.color || '#ffffff'
            drawShape(ctx, { ...particle, size: particle.size })
          }
        }
        
        ctx.restore()
      })

      // Restore canvas state
      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, settings])

  const canvasStyle = isOBSMode ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    zIndex: 1,
    opacity: 1
  } : {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 1,
    border: '2px solid #404040',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    background: '#1a1a1a'
  }

  return (
    <canvas
      ref={canvasRef}
      className="background-canvas"
      style={canvasStyle}
    />
  )
})

BackgroundCanvas.displayName = 'BackgroundCanvas'

export default BackgroundCanvas
