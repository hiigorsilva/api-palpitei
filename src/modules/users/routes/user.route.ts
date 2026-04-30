import type { FastifyInstance } from 'fastify'
import { userController } from '../instances/user.instance'
import {
  createUserSchema,
  getUserByIdSchema,
  listUsersSchema,
} from '../schemas/user.schema'

export const userRoute = async (app: FastifyInstance) => {
  app.post(
    '/user',
    createUserSchema,
    async (request, reply) => await userController.create(request, reply)
  )

  app.get('/user', listUsersSchema, (request, reply) =>
    userController.list(request, reply)
  )

  app.get('/user/:id', getUserByIdSchema, (request, reply) =>
    userController.getById(request, reply)
  )
}
