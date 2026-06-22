const API = `${window.location.protocol}//${window.location.hostname || 'localhost'}:8080/api`;
export const getToken = () => localStorage.getItem('beaconToken');
export function saveSession(session) { localStorage.setItem('beaconToken', session.token); }
export function clearSession() { localStorage.removeItem('beaconToken'); }
export async function api(path, options={}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type':'application/json', ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{}) ,...options.headers } });
  const data = response.status===204 ? null : await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.message || 'Request failed.');
  return data;
}
export const loginUser = payload => api('/auth/login',{method:'POST',body:JSON.stringify(payload)});
export const registerUser = payload => api('/auth/register',{method:'POST',body:JSON.stringify(payload)});
