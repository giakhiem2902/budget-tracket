import api from './api'

export const profileService = {
  get() {
    return api.get('/profile')
  },
  update(data) {
    return api.put('/profile', data)
  },
  deleteAccount() {
    return api.delete('/profile')
  },
}
