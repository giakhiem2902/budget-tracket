import api from './api'

export const reportService = {
  summary()    { return api.get('/reports/summary') },
  trends()     { return api.get('/reports/trends') },
  categories() { return api.get('/reports/categories') },
}
