import { tagsRepository } from './tags.repository.js'

export const tagsService = {
  async list() {
    return {
      data: await tagsRepository.findPublic(),
    }
  },
}
