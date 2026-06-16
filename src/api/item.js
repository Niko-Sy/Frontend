import request from '../utils/request'

export const listItems = (params) => request.get('/api/items', { params })
export const getItem = (id) => request.get(`/api/items/${id}`)
export const getPrivateItem = (id) => request.get(`/api/items/${id}/private-detail`)
export const increaseView = (id) => request.post(`/api/items/${id}/view/increase`)
export const listMyItems = (params) => request.get('/api/my/items', { params })
export const findSimilarItems = (data) => request.post('/api/items/similar', data)
export const createItem = (data) => request.post('/api/items', data)
export const updateItem = (id, data) => request.post(`/api/items/${id}/update`, data)
export const removeItem = (id, data = {}) => request.post(`/api/items/${id}/remove`, data)
export const deleteItem = (id) => request.post(`/api/items/${id}/delete`)
export const withdrawItem = (id) => request.post(`/api/items/${id}/withdraw`)
export const markFound = (id) => request.post(`/api/items/${id}/mark-found`)
