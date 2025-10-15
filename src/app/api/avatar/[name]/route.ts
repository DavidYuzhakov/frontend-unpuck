import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const name = params.name
    const size = request.nextUrl.searchParams.get('size') || '100'
    const bgColor = request.nextUrl.searchParams.get('bg') || 'random'
    
    // Генерируем цвет фона на основе имени
    const colors = [
      '3B82F6', // blue
      '10B981', // emerald
      'F59E0B', // amber
      'EF4444', // red
      '8B5CF6', // violet
      '06B6D4', // cyan
      '84CC16', // lime
      'F97316', // orange
      'EC4899', // pink
      '6366F1', // indigo
    ]
    
    const colorIndex = name.charCodeAt(0) % colors.length
    const backgroundColor = bgColor === 'random' ? colors[colorIndex] : bgColor
    
    // Получаем инициалы
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
    
    // Создаем SVG аватар
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#${backgroundColor}"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${parseInt(size) * 0.4}" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="central"
        >
          ${initials}
        </text>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Ошибка генерации аватара:', error)
    return new NextResponse('Ошибка генерации аватара', { status: 500 })
  }
}
