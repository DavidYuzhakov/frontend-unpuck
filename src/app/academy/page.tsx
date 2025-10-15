'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { academyAPI } from '@/lib/api'
import { ArrowLeftIcon, BookOpenIcon, ClockIcon, DocumentTextIcon, PlayIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useTelegramData } from '@/components/providers/telegram-data-provider'

interface Course {
  id: string
  title: string
  description: string
  content: string
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  order: number
  createdAt: string
  updatedAt: string
  lessons: Array<{
    id: string
    courseId: string
    title: string
    content: string
    videoUrl: string
    duration: number
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
    order: number
    createdAt: string
    updatedAt: string
  }>
  _count: {
    lessons: number
  }
}

const categories = ['Все', 'Видео', 'Статьи', 'Курсы']
const levels = ['Все уровни', 'Начинающий', 'Средний', 'Продвинутый']

export default function AcademyPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { userData } = useTelegramData()
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [selectedLevel, setSelectedLevel] = useState('Все уровни')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ completed: 0, inProgress: 0, total: 0 })

  // Определяем роль пользователя
  const userRole = userData?.role || user?.role || 'BUYER'
  const isManager = userRole === 'MANAGER'

  useEffect(() => {
    loadCourses()
    loadProgress()
  }, [])

  const loadCourses = async () => {
    try {
      console.log('🔄 Загружаем курсы с параметрами:', {
        category: selectedCategory !== 'Все' ? selectedCategory.toLowerCase() : undefined,
        level: selectedLevel !== 'Все уровни' ? selectedLevel.toLowerCase() : undefined,
        limit: 50
      })
      
      const response = await academyAPI.getCourses({
        category: selectedCategory !== 'Все' ? selectedCategory.toLowerCase() : undefined,
        level: selectedLevel !== 'Все уровни' ? selectedLevel.toLowerCase() : undefined,
        limit: 50
      })
      
      console.log('✅ Ответ сервера (курсы):', response.data)
      setCourses(response.data || [])
    } catch (error) {
      console.error('❌ Ошибка загрузки курсов:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      console.log('🔄 Загружаем прогресс...')
      const response = await academyAPI.getProgress()
      console.log('✅ Ответ сервера (прогресс):', response.data)
      setProgress(response.data || { completed: 0, inProgress: 0, total: 0 })
    } catch (error) {
      console.error('❌ Ошибка загрузки прогресса:', error)
    }
  }

  const getTypeIcon = () => {
    return <BookOpenIcon className="h-5 w-5" />
  }

  const getTypeText = () => {
    return 'Курс'
  }

  const getLevelText = (order: number) => {
    if (order <= 2) return 'Начинающий'
    if (order <= 4) return 'Средний'
        return 'Продвинутый'
  }

  const getLevelColor = (order: number) => {
    if (order <= 2) return 'bg-green-100 text-green-800'
    if (order <= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTotalDuration = (lessons: Course['lessons']) => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'Все' || selectedCategory === 'Курсы'
    
    const levelMatch = selectedLevel === 'Все уровни' ||
      (selectedLevel === 'Начинающий' && course.order <= 2) ||
      (selectedLevel === 'Средний' && course.order > 2 && course.order <= 4) ||
      (selectedLevel === 'Продвинутый' && course.order > 4)
    
    return categoryMatch && levelMatch
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка курсов...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.back()} className="p-1 -ml-1">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Академия</h1>
            </div>
            {/* Кнопка возврата в менеджер для менеджеров */}
            {isManager && (
              <button
                onClick={() => router.push('/manager')}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Менеджер</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Статистика */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Ваш прогресс</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progress.completed}</p>
                <p className="text-blue-100 text-sm">Завершено</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progress.inProgress}</p>
                <p className="text-blue-100 text-sm">В процессе</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progress.total}</p>
                <p className="text-blue-100 text-sm">Всего</p>
              </div>
            </div>
          </div>

          {/* Фильтры */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Тип материала</h4>
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
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Уровень сложности</h4>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Список курсов */}
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    <BookOpenIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getTypeIcon()}
                          <span className="text-xs text-gray-500">{getTypeText()}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.order)}`}>
                            {getLevelText(course.order)}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-medium text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatDuration(getTotalDuration(course.lessons))}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DocumentTextIcon className="h-3 w-3" />
                            <span>{course._count.lessons} уроков</span>
                            </div>
                        </div>
                      </div>
                      
                      <button className="ml-2 p-2 text-gray-400 hover:text-gray-600">
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Призыв к действию */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Получите сертификат!</h4>
            <p className="text-sm text-green-800 mb-3">
              Завершите все курсы и получите сертификат о прохождении обучения.
            </p>
            <button className="text-sm text-green-600 font-medium underline">
              Посмотреть требования
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
