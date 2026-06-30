import api from './api'

export const aiService = {
  categorize(description, amount) {
    return api.post('/ai/categorize', { description, amount })
  },
  insights() {
    return api.get('/ai/insights')
  },
}
