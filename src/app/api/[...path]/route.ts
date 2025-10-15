import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const url = new URL(request.url)
    const backendPath = `/${path.join('/')}`
    const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`

    console.log(`🔄 Прокси ${method} запрос к ${backendPath}`)
    console.log('🔗 Backend URL:', backendUrl)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Копируем заголовки авторизации
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    let body: string | undefined
    if (method !== 'GET') {
      try {
        body = await request.text()
      } catch (e) {
        console.log('⚠️ Не удалось прочитать тело запроса')
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    })

    console.log('📡 Статус ответа:', response.status)

    const responseText = await response.text()

    if (!response.ok) {
      console.log('❌ Ошибка ответа:', responseText)
      return NextResponse.json(
        { error: responseText },
        { status: response.status }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = responseText
    }

    console.log('✅ Ответ от бэкенда:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Ошибка прокси:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
