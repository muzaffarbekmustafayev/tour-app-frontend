/**
 * attractions.js — Tarixiy joylar (Attraction) API yordamchilari.
 * Barcha so'rovlar markaziy `api` axios klienti orqali o'tadi.
 */
import api from './api';

export const DISTRICTS = [
  'Navoiy shahri',
  'Nurota',
  'Xatirchi',
  'Qiziltepa'
];

// Public
export const fetchAttractions = (params = {}) =>
  api.get('/attractions', { params }).then((r) => r.data);

export const fetchAttraction = (id) =>
  api.get(`/attractions/${id}`).then((r) => r.data);

export const fetchNearbyStays = (id) =>
  api.get(`/attractions/${id}/nearby-stays`).then((r) => r.data);

// Customer
export const addAttractionReview = (id, payload) =>
  api.post(`/attractions/${id}/reviews`, payload).then((r) => r.data);

// Admin
export const createAttraction = (payload) =>
  api.post('/attractions', payload).then((r) => r.data);

export const updateAttraction = (id, payload) =>
  api.put(`/attractions/${id}`, payload).then((r) => r.data);

export const deleteAttraction = (id) =>
  api.delete(`/attractions/${id}`).then((r) => r.data);
