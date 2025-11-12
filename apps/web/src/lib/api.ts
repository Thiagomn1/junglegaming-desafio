import axios from 'axios'

import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(
        'Request:',
        config.method?.toUpperCase(),
        config.url,
        'params:',
        config.params,
      )
    } else {
      console.warn('No token available for request:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  register: async (data: {
    email: string
    password: string
    username: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Tasks API
export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  assignees?: Array<string>
  createdBy?: number
  createdByUsername?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  text: string
  authorId: number
  authorName?: string
  taskId: number
  createdAt: string
}

export const tasksApi = {
  getTasks: async (filters?: {
    status?: string
    priority?: string
  }): Promise<Array<Task>> => {
    const response = await api.get('/tasks', { params: filters })
    return response.data
  },
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },
  createTask: async (data: {
    title: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
  }): Promise<Task> => {
    const response = await api.post('/tasks', data)
    return response.data
  },
  updateTask: async (
    id: string,
    data: Partial<{
      title: string
      description: string
      status: string
      priority: string
      dueDate: string
    }>,
  ): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data)
    return response.data
  },
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
  getComments: async (taskId: string): Promise<Array<Comment>> => {
    const response = await api.get(`/tasks/${taskId}/comments`)
    return response.data
  },
  createComment: async (
    taskId: string,
    data: { text: string },
  ): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, data)
    return response.data
  },
}
