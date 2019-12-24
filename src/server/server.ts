import express from "express"
import path from "path"
import http from "http"
import socketIO from "socket.io"
import LuckyNumbersGame from "./luckyNumbersGame"
import RandomScreenNameGenerator from "./randomScreenNameGenerator"
import Player from "./player"

const port: number = 3000

class App {
    private server: http.Server
    private port: number

    private io: socketIO.Server
    private games: { [id: number]: LuckyNumbersGame } = {}
    private randomScreenNameGenerator: RandomScreenNameGenerator
    private players: { [id: string]: Player } = {}

    constructor(port: number) {
        this.port = port

        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))
        app.use('/jquery', express.static(path.join(__dirname, '../../node_modules/jquery/dist')))
        app.use('/bootstrap', express.static(path.join(__dirname, '../../node_modules/bootstrap/dist')))

        this.server = new http.Server(app)
        this.io = socketIO(this.server)

        this.games[0] = new LuckyNumbersGame(0, "Bronze Game", "🥉", 10, 1, 10, this.players, this.updateChat, this.sendPlayerDetails)
        this.games[1] = new LuckyNumbersGame(1, "Silver Game", "🥈", 16, 2, 20, this.players, this.updateChat, this.sendPlayerDetails)
        this.games[2] = new LuckyNumbersGame(2, "Gold Game", "🥇", 35, 10, 100, this.players, this.updateChat, this.sendPlayerDetails)

        this.randomScreenNameGenerator = new RandomScreenNameGenerator();

        this.io.on('connection', (socket: socketIO.Socket) => {
            console.log('a user connected : ' + socket.id)

            let screenName: ScreenName = this.randomScreenNameGenerator.generateRandomScreenName()

            this.players[socket.id] = new Player(screenName)

            socket.emit("playerDetails", this.players[socket.id].player)

            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id);
                if (this.players && this.players[socket.id]) {
                    delete this.players[socket.id]
                }
            });

            socket.on('chatMessage', function (chatMessage: ChatMessage) {
                socket.broadcast.emit('chatMessage', chatMessage)
            });

            socket.on('submitGuess', (gameId: number, guess: number) => {
                if (guess >= 0 && guess <= 10) {
                    if (this.games[gameId].submitGuess(socket.id, guess)) {
                        socket.emit("confirmGuess", gameId, guess, this.players[socket.id].player.score)
                    }
                }
            })
        })

        setInterval(() => {
            this.io.emit("GameStates", [this.games[0].gameState, this.games[1].gameState, this.games[2].gameState])
        }, 1000)
    }

    public updateChat = (chatMessage: ChatMessage) => {
        this.io.emit('chatMessage', chatMessage)
    }

    public sendPlayerDetails = (playerSocketId: string) => {
        this.io.to(playerSocketId).emit("playerDetails", this.players[playerSocketId].player)
    }

    public Start() {
        this.server.listen(this.port)
        console.log(`Server listening on port ${this.port}.`)
    }
}

new App(port).Start()