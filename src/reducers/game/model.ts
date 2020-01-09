namespace IGame {
    export interface ModelStatistics {
        totalCount: number
        completedCount: number
        percentCapacity: number
    }

    export interface ModelState {
        statistics: ModelStatistics
    }
}

export default IGame;