import { useEffect, useRef, useState } from 'react'
import Watermark from './Watermark'

const decodeVideoId = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.video_id
  } catch {
    return null
  }
}

const VideoPlayer = ({ token, title, userEmail }) => {
  const containerRef = useRef(null)

  const videoId = decodeVideoId(token)

  // Block right click
  useEffect(() => {
    const block = (e) => e.preventDefault()
    const container = containerRef.current
    if (container) {
      container.addEventListener('contextmenu', block)
    }
    return () => {
      if (container) container.removeEventListener('contextmenu', block)
    }
  }, [])

  // Block keyboard shortcuts
  useEffect(() => {
    const blockKeys = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        e.key === 'F12'
      ) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', blockKeys)
    return () => window.removeEventListener('keydown', blockKeys)
  }, [])

  if (!videoId) {
    return <div className="text-red-500">Invalid video token.</div>
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      {/* Video container with watermark */}
      <div ref={containerRef} className="relative bg-black" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&disablekb=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowFullScreen
        />
        <Watermark userEmail={userEmail} />
      </div>
    </div>
  )
}

export default VideoPlayer