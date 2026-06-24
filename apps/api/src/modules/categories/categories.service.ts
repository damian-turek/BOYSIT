import { categoriesRepository } from './categories.repository.js'

export const categoriesService = {
  async list() {
    return {
      data: await categoriesRepository.findActive(),
    }
  },
}
