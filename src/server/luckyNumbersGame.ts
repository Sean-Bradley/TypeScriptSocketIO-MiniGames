import Player from "./player"

export default class LuckyNumbersGame {
    private _id: number
    private _title: string
    private _logo: string
    private _gamePhase: number = 0
    private _gameClock: number = 0
    private _gameState: GameState
    private _duration: number
    private _result: number = -1
    private _players: { [id: string]: Player } = {}
    private _guesses: { [id: string]: number[] } = {}
    private _enterPoints: number
    private _winPoints: number
    private _winners: string[]
    private _winnersCalculated: boolean = false
    private _updateChatCallBack: (chatMessage: ChatMessage) => void
    private _sendPlayerDetailsCB: (playerSocketID: string) => void

    constructor(id: number,
        title: string,
        logo: string,
        duration: number,
        enterPoints: number,
        winPoints: number,
        players: { [id: string]: Player },
        updateChatCallBack: (chatMessage: ChatMessage) => void,
        sendPlayerDetailsCB: (playerSocketID: string) => void
    ) {
        this._id = id
        this._title = title
        this._logo = logo
        this._duration = duration
        this._players = players
        this._enterPoints = enterPoints
        this._winPoints = winPoints
        this._updateChatCallBack = updateChatCallBack
        this._sendPlayerDetailsCB = sendPlayerDetailsCB


        setInterval(() => {
            if (this._gamePhase === 0) {
                this._gameClock = this._duration
                this._gamePhase = 1
                this._result = -1
                this._winners = []
                this._winnersCalculated = false
                this._guesses = {}
                this._updateChatCallBack(<ChatMessage>{ message: "New Game", from: this._logo, type: "gameMessage" })
            } else if (this._gamePhase === 1) {
                if (this._gameClock < 0) {
                    this._gamePhase = 2
                    this._updateChatCallBack(<ChatMessage>{ message: "Game Closed", from: this._logo, type: "gameMessage" })
                }
            } else if (this._gamePhase === 2) {
                if (this._gameClock === -2) {
                    //calc a random number       
                    this._result = (Math.floor(Math.random() * 10) + 1)
                    this._updateChatCallBack(<ChatMessage>{ message: "Result : " + this._result, from: this._logo, type: "gameMessage" })
                } else if (this._gameClock === -3) {
                    //get winners   
                    this._winners = this.calculateWinners(this._result)
                    this._winners.forEach(w => {
                        if (this._players[w]) {
                            this._players[w].adjustScore(this._winPoints)
                            this._sendPlayerDetailsCB(w)
                        } else {
                            console.log(w + " has disconnected")
                        }
                    })
                    this._winnersCalculated = true
                } else if (this._gameClock <= -5) {
                    this._gamePhase = 0
                }
            }
            this._gameState = { id: this._id, title: this._title, logo: this._logo, gamePhase: this._gamePhase, gameClock: this._gameClock, duration: this._duration, result: this._result, winners: this._winners, winnersCalculated: this._winnersCalculated }
            this._gameClock -= 1
        }, 1000)
    }

    public get gameState() {
        return this._gameState
    }

    public submitGuess(playerSocketId: string, guess: number): boolean {
        if (!this._guesses[playerSocketId]) {
            this._guesses[playerSocketId] = []
        }
        this._players[playerSocketId].adjustScore(this._enterPoints * -1)
        this._guesses[playerSocketId].push(guess)
        if (this._guesses[playerSocketId].length === 1) {
            let chatMessage = <ChatMessage>{ message: this._players[playerSocketId].screenName.name + " is playing", from: this._logo, type: "gameMessage" }
            this._updateChatCallBack(chatMessage)
        }
        return true;
    }

    private calculateWinners(number: number): string[] {
        let ret: string[] = []
        for (let playerSocketId in this._guesses) {
            for (let guess in this._guesses[playerSocketId]) {
                if (number === this._guesses[playerSocketId][guess]) {
                    ret.push(playerSocketId)
                }
            }
        }
        return ret
    }
}