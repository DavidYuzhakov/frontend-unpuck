'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Как создать аккаунт?',
    answer: 'Для создания аккаунта нажмите кнопку "Регистрация", введите email и пароль, подтвердите email по ссылке из письма.',
    category: 'Регистрация'
  },
  {
    id: '2',
    question: 'Как совершить покупку?',
    answer: 'Найдите нужный товар в каталоге, нажмите "Купить", выберите способ оплаты и подтвердите заказ.',
    category: 'Покупки'
  },
  {
    id: '3',
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем банковские карты, электронные кошельки и криптовалюту. Все платежи защищены шифрованием.',
    category: 'Платежи'
  },
  {
    id: '4',
    question: 'Как отследить заказ?',
    answer: 'В разделе "Сделки" вы можете отслеживать статус ваших заказов и получать уведомления об изменениях.',
    category: 'Доставка'
  },
  {
    id: '5',
    question: 'Как вернуть товар?',
    answer: 'В течение 14 дней с момента получения товара вы можете оформить возврат в разделе "Сделки".',
    category: 'Возвраты'
  },
  {
    id: '6',
    question: 'Как связаться с поддержкой?',
    answer: 'Вы можете написать нам в чат поддержки, отправить email или позвонить по телефону горячей линии.',
    category: 'Поддержка'
  },
  {
    id: '7',
    question: 'Как стать продавцом?',
    answer: 'Пройдите верификацию, заполните анкету продавца и загрузите документы для подтверждения личности.',
    category: 'Продажи'
  },
  {
    id: '8',
    question: 'Как работает партнерская программа?',
    answer: 'Приглашайте друзей и получайте процент с их покупок. Чем больше рефералов, тем выше ваш доход.',
    category: 'Партнерство'
  }
]

const categories = ['Все', 'Регистрация', 'Покупки', 'Платежи', 'Доставка', 'Возвраты', 'Поддержка', 'Продажи', 'Партнерство']

export default function FAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Поиск */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ список */}
          <div className="space-y-4">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Вопросы не найдены</p>
              </div>
            ) : (
              filteredFAQ.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.question}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    </div>
                    {expandedItems.includes(item.id) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.id) && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
