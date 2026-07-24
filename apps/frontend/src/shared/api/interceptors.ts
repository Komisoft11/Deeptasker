import axios from 'axios'
import { AuthService, removeTokensStorage } from '@/entities/User'
import { API_URL } from '@/shared/config/api.config'
import { SERVER_ERROR_URL } from '@/shared/config/route.config'
import { getCollectedErrors } from '@/shared/helpers/errorCollector'
import { normalizeError } from '@/shared/helpers/logCollector'


const instance = axios.create({
  withCredentials: true,
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originRequest = error.config

    getCollectedErrors().push(normalizeError(error))

    if (error.code === 'ERR_NETWORK') {
      console.error(error)
      window.location.href = SERVER_ERROR_URL
      return instance.request(originRequest)
    }

    if (
      !originRequest.isRetry &&
      error.response &&
      error.response.status === 401
    ) {
      try {
        originRequest.isRetry = true
        await AuthService.getNewAccessToken()
        return instance.request(originRequest)
      } catch (e) {
        console.error(e)
        if (e.response.status === 401) removeTokensStorage()
      }
    }

    throw error
  }
)

export default instance

export const axiosClassic = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})
