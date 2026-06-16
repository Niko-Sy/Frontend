import request from '../utils/request'

export const login = (data) => request.post('/api/auth/login', data)
export const register = (data) => request.post('/api/auth/register', data)
export const getMe = () => request.get('/api/auth/me')
export const logout = () => request.post('/api/auth/logout')
export const updateProfile = (data) => request.post('/api/auth/profile/update', data)
export const updatePassword = (data) => request.post('/api/auth/password/update', data)
