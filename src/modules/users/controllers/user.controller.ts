import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { UserService } from '../services/user.service'

const createUserBodySchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
})

const paramsSchema = z.object({
  id: z.string(),
})

export class UserController {
  constructor(private userService: UserService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = createUserBodySchema.parse(request.body)
      if (!body.name || body.name.trim().length === 0) {
        return reply.status(400).send({ message: 'Nome é obrigatório' })
      }
      if (body.name.trim() === '') {
        return reply.status(400).send({ message: 'Nome não pode ser vazio' })
      }
      if (body.name && body.name.trim().length < 3) {
        return reply
          .status(400)
          .send({ message: 'Nome deve ter pelo menos 3 caracteres' })
      }
      if (body.name && body.name.trim().length > 50) {
        return reply
          .status(400)
          .send({ message: 'Nome deve ter no máximo 50 caracteres' })
      }

      const user = await this.userService.createUser(body)
      return reply.status(201).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.listUsers()
      return reply.status(200).send(users)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = paramsSchema.parse(request.params)
      const user = await this.userService.getUserById(params.id)
      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      return reply.status(200).send(user)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }
}
