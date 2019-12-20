"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const luckyNumbersGame_1 = __importDefault(require("./luckyNumbersGame"));
const randomScreenNameGenerator_1 = __importDefault(require("./randomScreenNameGenerator"));
const player_1 = __importDefault(require("./player"));
const port = 3000;
class App {
    constructor(port) {
        this._games = {};
        this._players = {};
        this.updateChat = (chatMessage) => {
            this._io.emit('chatMessage', chatMessage);
        };
        this.sendPlayerDetails = (playerSocketId) => {
            this._io.to(playerSocketId).emit("playerDetails", this._players[playerSocketId].player);
        };
        this._port = port;
        const app = express_1.default();
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        app.use('/jquery', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/jquery/dist')));
        app.use('/bootstrap', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/bootstrap/dist')));
        this._server = new http_1.default.Server(app);
        this._io = socket_io_1.default(this._server);
        this._games[0] = new luckyNumbersGame_1.default(0, "Bronze Game", "🥉", 10, 1, 10, this._players, this.updateChat, this.sendPlayerDetails);
        this._games[1] = new luckyNumbersGame_1.default(1, "Silver Game", "🥈", 16, 2, 20, this._players, this.updateChat, this.sendPlayerDetails);
        this._games[2] = new luckyNumbersGame_1.default(2, "Gold Game", "🥇", 35, 10, 100, this._players, this.updateChat, this.sendPlayerDetails);
        this._randomScreenNameGenerator = new randomScreenNameGenerator_1.default();
        this._io.on('connection', (socket) => {
            console.log('a user connected : ' + socket.id);
            let screenName = this._randomScreenNameGenerator.generateRandomScreenName();
            this._players[socket.id] = new player_1.default(screenName);
            socket.emit("playerDetails", this._players[socket.id].player);
            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id);
                if (this._players && this._players[socket.id]) {
                    delete this._players[socket.id];
                }
            });
            socket.on('chatMessage', function (chatMessage) {
                socket.broadcast.emit('chatMessage', chatMessage);
            });
            socket.on('submitGuess', (gameId, guess) => {
                if (guess >= 0 && guess <= 10) {
                    if (this._games[gameId].submitGuess(socket.id, guess)) {
                        socket.emit("confirmGuess", gameId, guess, this._players[socket.id].player.score);
                    }
                }
            });
        });
        setInterval(() => {
            this._io.emit("GameStates", [this._games[0].gameState, this._games[1].gameState, this._games[2].gameState]);
        }, 1000);
    }
    Start() {
        this._server.listen(this._port);
        console.log(`Server listening on port ${this._port}.`);
    }
}
new App(port).Start();
//# sourceMappingURL=server.js.map