type GameState = {
    id: number,
    title: string,
    gamePhase: number,
    gameClock: number,
    result: number,
    winners: string[]
    winnersCalculated: boolean,
    duration: number
}

type ScreenName = {
    name: string,
    abbreviation: string
}

type ChatMessage = {
    message: string,
    from: string,
    type: "playerMessage" | "gameMessage"
}

interface Player {
    score: number
    screenName: ScreenName
}

class Client {
    private _socket: SocketIOClient.Socket
    private _player: Player
    private _inThisRound: boolean[] = [false, false, false]
    private _alertedWinnersLoosers: boolean[] = [false, false, false]

    constructor() {
        this._socket = io();

        this._socket.on("connect", function () {
            console.log("connect")
        })

        this._socket.on("disconnect", function (message: any) {
            console.log("disconnect " + message)
            location.reload();
        })

        this._socket.on("GameStates", (gameStates: GameState[]) => {
            //console.dir(gameStates)
            gameStates.forEach(gameState => {
                let gid = gameState.id
                if (gameState.gameClock >= 0) {
                    if (gameState.gameClock >= gameState.duration) {
                        $("#gamephase" + gid).text("New Game, Guess the Lucky Number")
                        this._alertedWinnersLoosers[gid] = false
                        for (let x = 0; x < 10; x++) {
                            $("#submitButton" + gid + x).prop("disabled", false);
                        }
                    }
                    if (gameState.gameClock === gameState.duration - 5) {
                        $('#winnerAlert' + gid).alert().fadeOut(500)
                        $('#looserAlert' + gid).alert().fadeOut(500)
                        $('#resultAlert' + gid).alert().fadeOut(500)
                    }
                    $("#timer" + gid).css("display", "block")
                    $("#timer" + gid).text(gameState.gameClock.toString())
                    var progressPerent = (gameState.gameClock / gameState.duration) * 100;
                    $("#timerBar" + gid).css("background-color", "#4caf50")
                    $("#timerBar" + gid).css("width", progressPerent + "%")
                } else {
                    $("#timerBar" + gid).css("background-color", "#ff0000")
                    $("#timerBar" + gid).css("width", "100%")
                    $("#timer" + gid).css("display", "none")
                    $("#gamephase" + gid).text("Game Closed")
                    for (let x = 0; x < 10; x++) {
                        $("#submitButton" + gid + x).prop("disabled", true);
                    }
                    $("#goodLuckMessage" + gid).css("display", "none")

                    if (this._inThisRound[gid] && !this._alertedWinnersLoosers[gid] && gameState.winnersCalculated) {
                        this._inThisRound[gid] = false;
                        if (gameState.winners.includes(this._socket.id)) {
                            $('#winnerAlert' + gid).fadeIn(100)
                        } else {
                            $('#looserAlert' + gid).fadeIn(100)
                        }

                        this._alertedWinnersLoosers[gid] = true
                    }
                    if (gameState.gameClock === -2 && gameState.result !== -1) {
                        $('#resultValue' + gid).text(gameState.result)
                        $('#resultAlert' + gid).fadeIn(100)
                        $('#submitButton' + gid + (gameState.result - 1)).css("animation", "glowing 1000ms infinite");
                        setTimeout(() => {
                            $('#submitButton' + gid + (gameState.result - 1)).css("animation", "")
                        }, 4000)
                    }
                }
            })
        })

        this._socket.on("playerDetails", (player: Player) => {
            //console.dir(player)
            this._player = player
            $(".screenName").text(player.screenName.name)
            $(".score").text(player.score)
        })

        this._socket.on("confirmGuess", (gameId: number, guess: number, score: number) => {
            this._inThisRound[gameId] = true
            $("#submitButton" + gameId + (guess - 1)).prop("disabled", true);
            $("#goodLuckMessage" + gameId).css("display", "inline-block")
            $(".score").text(score)
        })

        this._socket.on("chatMessage", (chatMessage: ChatMessage) => {
            let ul = document.getElementById("messages")
            let li = document.createElement("li")
            if (chatMessage.type === "gameMessage") {
                li.innerHTML = "<span class='float-left'><span class='circle'>" + chatMessage.from + "</span></span><div class='gameMessage'>" + chatMessage.message + "</div>"
            } else {
                li.innerHTML = "<span class='float-right'><span class='circle'>" + chatMessage.from + "</span></span><div class='otherMessage'>" + chatMessage.message + "</div>"
            }
            ul.appendChild(li)
            this.scrollChatWindow()
        })


        $(document).ready(() => {
            $('#resultValue0').addClass('spinner');
            $('#resultValue1').addClass('spinner');
            $('#resultValue2').addClass('spinner');
            $('#resultAlert0').alert().hide()
            $('#winnerAlert0').alert().hide()
            $('#looserAlert0').alert().hide()
            $('#resultAlert1').alert().hide()
            $('#winnerAlert1').alert().hide()
            $('#looserAlert1').alert().hide()
            $('#resultAlert2').alert().hide()
            $('#winnerAlert2').alert().hide()
            $('#looserAlert2').alert().hide()

            $('#messageText').keypress((e) => {
                var key = e.which;
                if (key == 13)  // the enter key code
                {
                    this.sendMessage()
                    return false;
                }
            });
        })
    }

    public submitGuess(gameId: number, guess: number) {
        this._socket.emit("submitGuess", gameId, guess)
    }

    public sendMessage() {
        let messageText = $("#messageText").val();
        if (messageText.toString().length > 0) {

            this._socket.emit("chatMessage", <ChatMessage>{ message: messageText, from: this._player.screenName.abbreviation })

            let ul = document.getElementById("messages");
            let li = document.createElement("li");
            li.innerHTML = "<span class='float-left'><span class='circle'>" + this._player.screenName.abbreviation + "</span></span><div class='myMessage'>" + messageText + "</div>"
            ul.appendChild(li);

            this.scrollChatWindow()

            $("#messageText").val("");
        }
    }

    private scrollChatWindow = () => {
        $('#messages').animate({
            scrollTop: $('#messages li:last-child').position().top
        }, 500);
        setTimeout(() => {
            let messagesLength = $("#messages li");
            if (messagesLength.length > 10) {
                messagesLength.eq(0).remove();
            }
        }, 500)
    }

    public showGame(id: number) {
        switch (id) {
            case 0:
                $("#gamePanel1").fadeOut(100)
                $("#gamePanel2").fadeOut(100)
                $("#gamePanel0").delay(100).fadeIn(100)
                break;
            case 1:
                $("#gamePanel0").fadeOut(100)
                $("#gamePanel2").fadeOut(100)
                $("#gamePanel1").delay(100).fadeIn(100)
                break;
            case 2:
                $("#gamePanel0").fadeOut(100)
                $("#gamePanel1").fadeOut(100)
                $("#gamePanel2").delay(100).fadeIn(100)
                break;
        }
    }
}

const client = new Client();