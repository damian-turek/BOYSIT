import { technologiesRepository } from './technologies.repository.js'

export const technologiesService = {
  async list(categorySlug?: string) {
    return {
      data: await technologiesRepository.findActive(categorySlug),
    }
  },
}
