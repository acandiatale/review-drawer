'use client'

import { useEffect, useRef, useState } from 'react'
import { Database } from '@/lib/database.types'

type TeamMember = Database['public']['Tables']['team_members']['Row']

interface RouletteWheelProps {
  members: TeamMember[]
  isSpinning: boolean
  onSpinComplete?: (winners: { top: TeamMember; bottom: TeamMember }) => void
  onColorChange?: () => void
}

export default function RouletteWheel({
  members,
  isSpinning,
  onSpinComplete,
  onColorChange,
}: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const [wheelColors, setWheelColors] = useState<string[]>([])

  // 색상 팔레트 모음
  const colorPalettes = [
    // 선명한 레인보우
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFD93D'],
    // 파스텔 톤
    ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#FFBAF3', '#E0BBE4', '#C7CEEA'],
    // 네온 컬러
    ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFB4', '#FF4365', '#00D9FF'],
    // 어스 톤
    ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#BC6C25', '#606C38', '#DDA15E'],
    // 그라디언트 블루
    ['#03045E', '#023E8A', '#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4'],
    // 선셋 컬러
    ['#FFCDB2', '#FFB4A2', '#E5989B', '#B5838D', '#6D6875', '#FF8DC7', '#FFC2D1', '#FFB3C6'],
    // 비비드 팝
    ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE'],
    // 민트 그린
    ['#D8F3DC', '#B7E4C7', '#95D5B2', '#74C69D', '#52B788', '#40916C', '#2D6A4F', '#1B5E3F'],
  ]

  // 랜덤 색상 생성 함수
  const generateRandomColors = () => {
    const paletteIndex = Math.floor(Math.random() * colorPalettes.length)
    const selectedPalette = colorPalettes[paletteIndex]
    if (!selectedPalette) return []
    
    const colors: string[] = []
    
    for (let i = 0; i < members.length; i++) {
      // 팔레트 색상을 순환하면서 사용
      const color = selectedPalette[i % selectedPalette.length]
      if (color) {
        colors.push(color)
      }
    }
    
    // 색상을 섞어서 더 랜덤하게
    return colors.sort(() => Math.random() - 0.5)
  }

  // 색상 변경 함수
  const handleColorChange = () => {
    if (members.length > 0) {
      setWheelColors(generateRandomColors())
      onColorChange?.()
    }
  }

  // members가 변경될 때마다 새로운 색상 생성
  useEffect(() => {
    if (members.length > 0) {
      setWheelColors(generateRandomColors())
    }
  }, [members])

  useEffect(() => {
    drawWheel()
  }, [members, rotation, wheelColors])

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      startSpin()
    }
  }, [isSpinning])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas || members.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw wheel segments
    const anglePerMember = (2 * Math.PI) / members.length

    members.forEach((member, index) => {
      const startAngle = index * anglePerMember + rotation
      const endAngle = (index + 1) * anglePerMember + rotation

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = wheelColors[index] || '#ccc'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + anglePerMember / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(member.name, radius - 10, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw pointers
    // Top pointer
    ctx.beginPath()
    ctx.moveTo(centerX - 20, 10)
    ctx.lineTo(centerX + 20, 10)
    ctx.lineTo(centerX, 40)
    ctx.closePath()
    ctx.fillStyle = '#FF0000'
    ctx.fill()
    ctx.strokeStyle = '#8B0000'
    ctx.lineWidth = 2
    ctx.stroke()

    // Bottom pointer
    ctx.beginPath()
    ctx.moveTo(centerX - 20, canvas.height - 10)
    ctx.lineTo(centerX + 20, canvas.height - 10)
    ctx.lineTo(centerX, canvas.height - 40)
    ctx.closePath()
    ctx.fillStyle = '#0000FF'
    ctx.fill()
    ctx.strokeStyle = '#000080'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const startSpin = () => {
    setIsAnimating(true)
    startTimeRef.current = Date.now()
    const duration = 4000 + Math.random() * 2000 // 4-6 seconds
    const finalRotation = rotation + Math.PI * 2 * (5 + Math.random() * 5) // 5-10 full rotations

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentRotation = rotation + (finalRotation - rotation) * easeOut

      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        if (onSpinComplete) {
          const winners = getWinners(currentRotation)
          if (winners) {
            onSpinComplete(winners)
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const getWinners = (finalRotation: number) => {
    if (members.length === 0) return null

    const anglePerMember = (2 * Math.PI) / members.length
    const normalizedRotation =
      ((finalRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    // Top pointer (pointing down at 0 degrees)
    const topIndex =
      Math.floor(
        ((2 * Math.PI - normalizedRotation) % (2 * Math.PI)) / anglePerMember,
      ) % members.length

    // Bottom pointer (pointing up at 180 degrees)
    const bottomIndex =
      Math.floor(
        ((3 * Math.PI - normalizedRotation) % (2 * Math.PI)) / anglePerMember,
      ) % members.length

    const top = members[topIndex]
    const bottom = members[bottomIndex]

    if (!top || !bottom) return null

    return {
      top,
      bottom,
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      {members.length > 0 && (
        <button
          onClick={handleColorChange}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a6 6 0 00-2-4l-2-2V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v5l-2 2a6 6 0 00-2 4v4a2 2 0 002 2z" />
          </svg>
          색상 변경
        </button>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-4 border-gray-300 rounded-full shadow-2xl"
      />
      <div className="mt-4 text-center">
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-sm font-medium">상단 포인터</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span className="text-sm font-medium">하단 포인터</span>
          </div>
        </div>
      </div>
    </div>
  )
}
