type GameState = {
    id: number
    title: string
    logo: string
    gamePhase: number
    gameClock: number
    result: number
    winners: string[]
    winnersCalculated: boolean
    duration: number
}