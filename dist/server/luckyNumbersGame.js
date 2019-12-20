"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LuckyNumbersGame {
    constructor(id, title, logo, duration, enterPoints, winPoints, players, updateChatCB, sendPlayerDetailsCB) {
        this._gamePhase = 0;
        this._gameClock = 0;
        this._players = {};
        this._guesses = {};
        this._result = -1;
        this._winnersCalculated = false;
        this._id = id;
        this._title = title;
        this._logo = logo;
        this._duration = duration;
        this._enterPoints = enterPoints;
        this._winPoints = winPoints;
        this._updateChatCB = updateChatCB;
        this._sendPlayerDetailsCB = sendPlayerDetailsCB;
        this._players = players;
        setInterval(() => {
            if (this._gamePhase === 0) {
                this._gameClock = this._duration;
                this._gamePhase = 1;
                this._result = -1;
                this._winners = [];
                this._winnersCalculated = false;
                this._guesses = {};
                this._updateChatCB({ message: "New Game", from: this._logo, type: "gameMessage" });
            }
            else if (this._gamePhase === 1) {
                if (this._gameClock < 0) {
                    this._gamePhase = 2;
                    this._updateChatCB({ message: "Game Closed", from: this._logo, type: "gameMessage" });
                }
            }
            else if (this._gamePhase === 2) {
                if (this._gameClock === -2) {
                    //calc a random number       
                    this._result = (Math.floor(Math.random() * 10) + 1);
                    this._updateChatCB({ message: "Result : " + this._result, from: this._logo, type: "gameMessage" });
                }
                else if (this._gameClock === -3) {
                    //get winners   
                    this._winners = this.calculateWinners(this._result);
                    this._winners.forEach(w => {
                        this._players[w].adjustScore(this._winPoints);
                        this._sendPlayerDetailsCB(w);
                    });
                    this._winnersCalculated = true;
                }
                else if (this._gameClock <= -5) {
                    this._gamePhase = 0;
                }
            }
            this._gameState = { id: this._id, title: this._title, logo: this._logo, gamePhase: this._gamePhase, gameClock: this._gameClock, winners: this._winners, result: this._result, winnersCalculated: this._winnersCalculated, duration: this._duration };
            this._gameClock -= 1;
        }, 1000);
    }
    get gameState() {
        return this._gameState;
    }
    submitGuess(playerSocketId, guess) {
        if (!this._guesses[playerSocketId]) {
            this._guesses[playerSocketId] = [];
        }
        this._players[playerSocketId].adjustScore(this._enterPoints * -1);
        this._guesses[playerSocketId].push(guess);
        if (this._guesses[playerSocketId].length === 1) {
            let chatMessage = { message: this._players[playerSocketId].screenName.name + " is playing", from: this._logo, type: "gameMessage" };
            this._updateChatCB(chatMessage);
        }
        return true;
    }
    calculateWinners(number) {
        let ret = [];
        for (let playerSocketId in this._guesses) {
            for (let guess in this._guesses[playerSocketId]) {
                if (number === this._guesses[playerSocketId][guess]) {
                    ret.push(playerSocketId);
                }
            }
        }
        return ret;
    }
}
exports.default = LuckyNumbersGame;
//# sourceMappingURL=luckyNumbersGame.js.map