import { useEffect, useState } from 'react'

const positions = [
  { top: '10%', left: '10%' },
  { top: '10%', left: '60%' },
  { top: '50%', left: '30%' },
  { top: '70%', left: '60%' },
  { top: '30%', left: '70%' },
]

const Watermark = ({ userEmail }) => {
  const [posIndex, setPosIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosIndex(prev => (prev + 1) % positions.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const pos = positions[posIndex]

  return (
    <div
      className="absolute pointer-events-none select-none z-10 transition-all duration-1000"
      style={{
        top: pos.top,
        left: pos.left,
        opacity: 0.4,
      }}
    >
      <p className="text-white text-xs font-medium bg-black bg-opacity-30 px-2 py-1 rounded">
        {userEmail}
      </p>
      <p className="text-white text-xs bg-black bg-opacity-30 px-2 py-1 rounded mt-1">
        {new Date().toLocaleString()}
      </p>
    </div>
  )
}

export default Watermark