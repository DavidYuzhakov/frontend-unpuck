'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { profileAPI } from '@/lib/api'
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// toast removed

interface SocialLink {
  id: string
  platform: 'telegram' | 'instagram' | 'youtube' | 'tiktok'
  username: string
  url: string
  verified: boolean
  displayName?: string
  avatar?: string
  followers?: number
  bio?: string
  externalId?: string
}

interface SocialUserData {
  platform: string
  username: string
  displayName: string
  avatar?: string
  followers?: number
  verified: boolean
  url: string
  bio?: string
  externalId?: string
}

export default function SocialPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLink, setNewLink] = useState({
    platform: 'telegram' as 'telegram' | 'instagram' | 'youtube' | 'tiktok',
    username: '',
    url: '',
  })
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const [userData, setUserData] = useState<SocialUserData | null>(null)

  useEffect(() => {
    loadSocialLinks()
  }, [])

  const loadSocialLinks = async () => {
    try {
      setIsLoading(true)
      const response = await profileAPI.getSocialLinks()
      if (response.data.success) {
        const data = response.data.data || []
        // Убеждаемся, что data является массивом
        if (Array.isArray(data)) {
          setSocialLinks(data)
        } else {
          console.warn('API вернул не массив:', data)
          setSocialLinks([])
        }
      } else {
        console.warn('API вернул ошибку:', response.data.message)
        setSocialLinks([])
      }
    } catch (error: any) {
      console.error('Ошибка загрузки социальных сетей:', error)
      // Используем моковые данные
      setSocialLinks([
        {
          id: '1',
          platform: 'telegram',
          username: '@ivan_petrov',
          url: 'https://t.me/ivan_petrov',
          verified: true,
        },
        {
          id: '2',
          platform: 'instagram',
          username: '@ivan_petrov_insta',
          url: 'https://instagram.com/ivan_petrov_insta',
          verified: false,
        },
      ])
      console.error(
        '❌ Не удалось загрузить социальные сети. Показаны демонстрационные данные.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserData = async (platform: string, username: string) => {
    if (!username.trim()) {
      setUserData(null)
      return
    }

    try {
      setIsLoadingUserData(true)
      const response = await profileAPI.getUserData(platform, username)

      if (response.data.success && response.data.data) {
        setUserData(response.data.data)
        // Автоматически заполняем URL на основе полученных данных
        setNewLink((prev) => ({
          ...prev,
          url: response.data.data.url || prev.url,
        }))
        console.log('✅ Данные пользователя загружены!')
      } else {
        setUserData(null)
        console.error(
          '❌',
          response.data.message || 'Не удалось загрузить данные пользователя'
        )
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных пользователя:', error)
      setUserData(null)
      console.error('❌ Ошибка загрузки данных пользователя')
    } finally {
      setIsLoadingUserData(false)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await profileAPI.createSocialLink(newLink)
      if (response.data.success) {
        // Перезагружаем список ссылок из БД
        await loadSocialLinks()
        setNewLink({ platform: 'telegram', username: '', url: '' })
        setUserData(null)
        setShowAddForm(false)
        console.log('✅ Социальная сеть добавлена!')
      } else {
        console.error(
          '❌',
          response.data.message || 'Ошибка добавления социальной сети'
        )
      }
    } catch (error: any) {
      console.error('Ошибка добавления социальной сети:', error)
      console.error('❌ Не удалось добавить социальную сеть')
    }
  }

  const handleRemoveLink = async (linkId: string) => {
    try {
      const response = await profileAPI.deleteSocialLink(linkId)
      if (response.data.success) {
        // Перезагружаем список ссылок из БД
        await loadSocialLinks()
        console.log('✅ Социальная сеть удалена!')
      } else {
        console.error(
          '❌',
          response.data.message || 'Ошибка удаления социальной сети'
        )
      }
    } catch (error: any) {
      console.error('Ошибка удаления социальной сети:', error)
      console.error('❌ Не удалось удалить социальную сеть')
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return '📱'
      case 'instagram':
        return '📷'
      case 'youtube':
        return '📺'
      case 'tiktok':
        return '🎵'
      default:
        return '🔗'
    }
  }

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return 'Telegram'
      case 'instagram':
        return 'Instagram'
      case 'youtube':
        return 'YouTube'
      case 'tiktok':
        return 'TikTok'
      default:
        return platform
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </MainLayout>
    )
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
            <h1 className="text-xl font-bold text-gray-900">Социальные сети</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Social Links List */}
          <div className="space-y-4">
            {Array.isArray(socialLinks) &&
              socialLinks.map((link, index) => (
                <div
                  key={link.id || `link-${index}`}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getPlatformIcon(link.platform)}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {getPlatformLabel(link.platform)}
                          </h3>
                          {link.verified && (
                            <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-2 h-2 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{link.username}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Social Link */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Добавить социальную сеть</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddLink}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Добавить социальную сеть
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Платформа
                </label>
                <select
                  value={newLink.platform}
                  onChange={(e) => {
                    setNewLink((prev) => ({
                      ...prev,
                      platform: e.target.value as any,
                      username: '',
                      url: '',
                    }))
                    setUserData(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newLink.username}
                    onChange={(e) =>
                      setNewLink((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      loadUserData(newLink.platform, newLink.username)
                    }
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="@username"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      loadUserData(newLink.platform, newLink.username)
                    }
                    disabled={isLoadingUserData || !newLink.username.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingUserData ? '...' : '🔍'}
                  </button>
                </div>
              </div>

              {/* Показываем загруженные данные пользователя */}
              {userData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Данные пользователя:
                  </h4>
                  <div className="flex items-center space-x-3">
                    {userData.avatar && (
                      <img
                        src={userData.avatar}
                        alt={userData.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">
                        {userData.displayName}
                      </p>
                      <p className="text-sm text-blue-700">
                        {userData.username}
                      </p>
                      {userData.followers && (
                        <p className="text-xs text-blue-600">
                          {userData.followers.toLocaleString()} подписчиков
                        </p>
                      )}
                      {userData.bio && (
                        <p className="text-xs text-blue-600 mt-1">
                          {userData.bio}
                        </p>
                      )}
                    </div>
                    {userData.verified && (
                      <span className="text-green-600 text-sm">✓ Проверен</span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, url: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://t.me/username"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
