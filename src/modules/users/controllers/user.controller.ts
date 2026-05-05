import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserService } from '../services/user.service'

type CreateUserBody = {
  name: string
}

type GetUserByIdParams = {
  id: string
}

export class UserController {
  constructor(private userService: UserService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateUserBody
    const user = await this.userService.createUser(body)
    return reply.status(201).send(user)
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateUserBody
    const user = await this.userService.loginByName(body)
    return reply.status(200).send(user)
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const users = await this.userService.listUsers()
    return reply.status(200).send(users)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as GetUserByIdParams
    const user = await this.userService.getUserById(id)

    if (!user) throw { statusCode: 404, message: 'Usuário não encontrado' }
    return reply.status(200).send(user)
  }
}
