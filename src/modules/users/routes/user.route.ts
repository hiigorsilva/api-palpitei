import type { FastifyInstance } from 'fastify'
import { userController } from '../instances/user.instance'
import {
  createUserSchema,
  getUserByIdSchema,
  listUsersSchema,
  loginUserSchema,
} from '../schemas/user.schema'

export const userRoute = async (app: FastifyInstance) => {
  app.post('/auth/login', loginUserSchema, async (request, reply) =>
    userController.login(request, reply)
  )

  app.post(
    '/users',
    createUserSchema,
    async (request, reply) => await userController.create(request, reply)
  )

  app.get('/users', listUsersSchema, (request, reply) =>
    userController.list(request, reply)
  )

  app.get('/users/:id', getUserByIdSchema, (request, reply) =>
    userController.getById(request, reply)
  )
}
