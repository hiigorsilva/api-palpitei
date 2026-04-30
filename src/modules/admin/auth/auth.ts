import type { FastifyReply, FastifyRequest } from 'fastify'

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1327'

export function basicAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    reply
      .status(401)
      .header('WWW-Authenticate', 'Basic')
      .send({ message: 'Autenticação necessária' })
    return
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')

  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    done()
  } else {
    reply.status(401).send({ message: 'Credenciais inválidas' })
  }
}
