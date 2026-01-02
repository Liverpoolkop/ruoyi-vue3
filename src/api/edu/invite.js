import request from '@/utils/request'

export function joinByInvite(code) {
  return request({ url: '/edu/join/by-code', method: 'post', params: { code } })
}
