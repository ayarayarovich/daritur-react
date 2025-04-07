import { Axios } from '@/shared'

export const getHealth = async () => {
  await Axios.publicClient.get('/health')
}
