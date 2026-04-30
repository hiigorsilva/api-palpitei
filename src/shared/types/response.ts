export interface IPaginationOutput<T> {
  data: T[]
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
}
