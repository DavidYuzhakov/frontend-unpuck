'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { IMessage, SupportTicket } from '@/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supportAPI } from '@/lib/api'
// toast removed

export default function SupportPage() {
  // Чат состояние
  const [messages, setMessages] = useState<IMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const { data } = await supportAPI.getMessages()
      setMessages(data)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для чата
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await supportAPI.createTickets(newMessage)
      setMessages((prev) => [...prev, data.messages[0]])
    } catch (error) {
      console.log(error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    })
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Поддержка</h1>
          </div>
        </div>

        {/* Чат на весь экран */}
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Заголовок чата */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-medium text-gray-900">
              Онлайн чат с поддержкой
            </h3>
            <p className="text-sm text-gray-500">
              Обычно отвечаем в течение 5 минут
            </p>
          </div>

          {/* Сообщения чата */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка сообщений...</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'USER' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    {/* Подпись отправителя */}
                    <div
                      className={`text-xs text-gray-500 mb-1 ${
                        message.sender === 'USER' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.sender === 'USER' ? 'Вы' : 'Админ'}
                    </div>

                    {/* Сообщение */}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender === 'USER'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>

                    {/* Время */}
                    <p
                      className={`text-xs mt-1 text-gray-500 ${
                        message.sender === 'USER' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Индикатор печати */}
            <div ref={chatEndRef} />
          </div>

          {/* Форма отправки сообщения */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
