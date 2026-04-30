export interface IUser {
  id: string
  name: string
  created_at: Date
}

export interface ICreateUserDTO extends Pick<IUser, 'name'> {}

export interface IUserRepository {
  create(name: string): Promise<IUser>
  findById(id: string): Promise<IUser | null>
  findByName(name: string): Promise<IUser | null>
  findAll(): Promise<IUser[]>
}
