/**
 * RetailVision - Axios API Client
 */

import axios from 'axios'
import type { Store, StoreAnalyticsBundle, StoreForecastResponse, UserSession } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 45000,
})

export const authApi = {
  login: async (login: string, password: string): Promise<UserSession> => {
    const res = await api.post('/auth/login', { login, password })
    return res.data
  },
  me: async (): Promise<any> => {
    const res = await api.get('/auth/me')
    return res.data
  }
}

export const storeApi = {
  listStores: async (): Promise<Store[]> => {
    const res = await api.get('/stores')
    return res.data
  },

  getStoreAnalytics: async (storeId: string): Promise<StoreAnalyticsBundle> => {
    const res = await api.get(`/stores/${storeId}/analytics`)
    return res.data
  },

  getStoreForecast: async (storeId: string, horizonDays: number = 30): Promise<StoreForecastResponse> => {
    const res = await api.post(`/stores/${storeId}/forecast`, { horizon_days: horizonDays })
    return res.data
  },

  constructStore: async (formData: FormData): Promise<Store> => {
    const res = await api.post('/stores/construct', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  deleteStore: async (storeId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/stores/${storeId}`)
    return res.data
  },

  getPdfReportUrl: (storeId: string): string => {
    return `/api/stores/${storeId}/report/pdf`
  },

  getCsvDataUrl: (storeId: string): string => {
    return `/api/stores/${storeId}/report/csv`
  }
}

export default api
