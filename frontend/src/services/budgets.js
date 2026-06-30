import api from './api'

export const budgetService = {
  list()                     { return api.get('/budgets') },
  createOrUpdate(data)       { return api.post('/budgets', data) },
  getByMonth(year, month)    { return api.get(`/budgets/${year}/${month}`) },
}
