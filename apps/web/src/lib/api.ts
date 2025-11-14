import axios from 'axios'

import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
  getAllUsers: async (): Promise<Array<{ id: number; username: string }>> => {
    const response = await api.get('/auth/users')
    return response.data
  },
}

// Tasks API
export interface Assignee {
  id: number
  username: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  assignees?: Array<number>
  assigneesDetails?: Array<Assignee>
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

export interface TaskHistoryEntry {
  id: number
  taskId: number
  action: 'created' | 'updated' | 'commented' | 'deleted'
  userId: number | null
  username?: string | null
  metadata: Record<string, unknown> | null
  timestamp: string
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
    assignees?: Array<number>
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
      assignees: Array<number>
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
  getHistory: async (taskId: string): Promise<Array<TaskHistoryEntry>> => {
    const response = await api.get(`/tasks/${taskId}/history`)
    return response.data
  },
}
