import express from "express"
import path from "path"
import http from "http"
import socketIO from "socket.io"
import LuckyNumbersGame from "./luckyNumbersGame"
import RandomScreenNameGenerator from "./randomScreenNameGenerator"
import Player from "./player"

const port: number = 3000

class App {
    private _server: http.Server
    private _port: number

    private _io: socketIO.Server
    private _games: { [id: number]: LuckyNumbersGame } = {}
    private _randomScreenNameGenerator: RandomScreenNameGenerator
    private _players: { [id: string]: Player } = {}

    constructor(port: number) {
        this._port = port

        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))
        app.use('/jquery', express.static(path.join(__dirname, '../../node_modules/jquery/dist')))
        app.use('/bootstrap', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist')))

        this._server = new http.Server(app)
        this._io = socketIO(this._server)

        this._games[0] = new LuckyNumbersGame(0, "Bronze Game", "🥉", 10, 1, 10, this._players, this.updateChat, this.sendPlayerDetails)
        this._games[1] = new LuckyNumbersGame(1, "Silver Game", "🥈", 16, 2, 20, this._players, this.updateChat, this.sendPlayerDetails)
        this._games[2] = new LuckyNumbersGame(2, "Gold Game", "🥇", 35, 10, 100, this._players, this.updateChat, this.sendPlayerDetails)

        this._randomScreenNameGenerator = new RandomScreenNameGenerator();

        this._io.on('connection', (socket: socketIO.Socket) => {
            console.log('a user connected : ' + socket.id)

            let screenName: ScreenName = this._randomScreenNameGenerator.generateRandomScreenName()

            this._players[socket.id] = new Player(screenName)

            socket.emit("playerDetails", this._players[socket.id].player)

            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id);
                if (this._players && this._players[socket.id]) {
                    delete this._players[socket.id]
                }
            });

            socket.on('chatMessage', function (chatMessage: ChatMessage) {
                socket.broadcast.emit('chatMessage', chatMessage)
            });

            socket.on('submitGuess', (gameId: number, guess: number) => {
                if (guess >= 0 && guess <= 10) {
                    if (this._games[gameId].submitGuess(socket.id, guess)) {
                        socket.emit("confirmGuess", gameId, guess, this._players[socket.id].player.score)
                    }
                }
            })
        })

        setInterval(() => {
            this._io.emit("GameStates", [this._games[0].gameState, this._games[1].gameState, this._games[2].gameState])
        }, 1000)
    }

    public updateChat = (chatMessage: ChatMessage) => {
        this._io.emit('chatMessage', chatMessage)
    }

    public sendPlayerDetails = (playerSocketId: string) => {
        this._io.to(playerSocketId).emit("playerDetails", this._players[playerSocketId].player)
    }

    public Start() {
        this._server.listen(this._port)
        console.log(`Server listening on port ${this._port}.`)
    }
}

new App(port).Start()