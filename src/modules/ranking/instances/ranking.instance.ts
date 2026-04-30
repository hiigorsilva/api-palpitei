import { RankingController } from '../controllers/ranking.controller'
import { RankingRepository } from '../repositories/ranking.repository'
import { RankingService } from '../services/ranking.service'

const rankingRepository = new RankingRepository()
const rankingService = new RankingService(rankingRepository)
export const rankingController = new RankingController(rankingService)
