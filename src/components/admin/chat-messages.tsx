'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { IMessage, SupportTicket } from '@/types'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { useMemo, useState } from 'react'

interface ChatMessagesProps {
  tickets: SupportTicket[]
  onReply: (ticketId: string, content: string) => void
}

export function ChatMessages({ tickets, onReply }: ChatMessagesProps) {
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const messages = useMemo(
    () => tickets.flatMap((ticket) => ticket.messages),
    [tickets]
  )
  const ticketStatusMap = useMemo(
    () => new Map(tickets.map((t) => [t.id, t.status])),
    [tickets]
  )
  const onlyUserMessages = useMemo(
    () => messages.filter((m) => m.sender === 'USER'),
    [messages]
  )
  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return
    onReply(selectedMessage.ticketId, replyText)
    setSelectedMessage(null)
    setReplyText('')
  }

  const isResolved = (ticketId: string) => {
    return ticketStatusMap.get(ticketId) === 'RESOLVED'
  }

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Сообщения чатов</h2>
        <Badge variant="outline" className="text-sm">
          Всего: {onlyUserMessages.length}
        </Badge>
      </div>

      {/* Список сообщений */}
      <div className="space-y-3">
        {onlyUserMessages.length === 0 ? (
          <Card className="p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Сообщений пока нет</p>
          </Card>
        ) : (
          onlyUserMessages.map((message) => (
            <Card
              key={message.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Заголовок сообщения */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {message.id ? (
                        <img
                          src={message.user.avatar}
                          alt={message.user.firstName}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {message.user.firstName} {message.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{message.user.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Содержимое сообщения */}
                <div className="pl-11">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
                <div className="border-t border-gray-100" />

                <div className="flex items-center gap-2 justify-end ">
                  {isResolved(message.ticketId) ? (
                    <div className="p-2 w-auto rounded bg-green-100 flex gap-1 text-xs items-center">
                      <CheckCircleIcon color="#22c55e" className="h-4 w-4" />
                      Решенный
                    </div>
                  ) : (
                    <div className="p-2 w-auto rounded bg-orange-100 flex gap-1 text-xs items-center text-ora">
                      <QuestionMarkCircleIcon
                        color="#fb923c"
                        className="h-4 w-4"
                      />
                      Открытый
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMessage(message)}
                    className="text-xs"
                  >
                    <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                    Ответить
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Модальное окно для ответа */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ответ на сообщение
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  От: {selectedMessage.user.firstName}{' '}
                  {selectedMessage.user.lastName}
                </p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                  {selectedMessage.text}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш ответ:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Введите ответ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMessage(null)
                    setReplyText('')
                  }}
                  className="text-sm"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="text-sm"
                >
                  Отправить ответ
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
