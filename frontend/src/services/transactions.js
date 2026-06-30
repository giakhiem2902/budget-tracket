import api from './api'

export const transactionService = {
  list(params)       { return api.get('/transactions', { params }) },
  create(data)       { return api.post('/transactions', data) },
  update(id, data)   { return api.put(`/transactions/${id}`, data) },
  remove(id)         { return api.delete(`/transactions/${id}`) },
  async uploadReceipt(id, file) {
    const res = await api.post(`/transactions/${id}/receipt`, { contentType: file.type })
    const { uploadUrl, viewUrl } = res.data
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    return viewUrl
  },
}
