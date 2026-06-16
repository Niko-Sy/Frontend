import request from '../utils/request'

export const listMyClues = (params) => request.get('/api/my/clues', { params })
export const listItemClues = (itemId, params) => request.get(`/api/items/${itemId}/clues`, { params })
export const createClue = (itemId, data) => request.post(`/api/items/${itemId}/clues`, data)
export const acceptClue = (id) => request.post(`/api/clues/${id}/accept`)
export const ignoreClue = (id) => request.post(`/api/clues/${id}/ignore`)
