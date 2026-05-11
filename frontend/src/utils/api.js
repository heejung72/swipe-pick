import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', timeout: 15000 })

export const createRoom = (formData) =>
  api.post('/api/rooms', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)

export const getRoom = (code) =>
  api.get(`/api/rooms/${code}`).then(r => r.data)

export const getResults = (code) =>
  api.get(`/api/rooms/${code}/results`).then(r => r.data)
