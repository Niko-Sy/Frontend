import request from '../utils/request'

export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request.post('/api/files/upload', form)
}

export const uploadFiles = (files) => {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return request.post('/api/files/upload/batch', form)
}
