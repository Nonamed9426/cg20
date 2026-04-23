// API 서버 주소 — 변경 시 .env 파일의 VITE_API_BASE만 수정하면 됩니다.
// 예) VITE_API_BASE=http://192.168.0.105:8000
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://192.168.0.177:8000';
