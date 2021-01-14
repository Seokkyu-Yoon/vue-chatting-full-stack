import pino from 'pino'
import { ConfigPino } from '@/config'

const logger = pino(ConfigPino)

export default logger
