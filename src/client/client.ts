class Client {
    private socket: SocketIOClient.Socket
    private player: Player = { score: 0, screenName: { name: "", abbreviation: "" } }
    private inThisRound: boolean[] = [false, false, false]
    private alertedWinnersLoosers: boolean[] = [false, false, false]

    constructor() {
        this.socket = io();

        this.socket.on("connect", function () {
            console.log("connect")
        })

        this.socket.on("disconnect", function (message: any) {
            console.log("disconnect " + message)
            location.reload();
        })

        this.socket.on("GameStates", (gameStates: GameState[]) => {
            //console.dir(gameStates)
            gameStates.forEach(gameState => {
                let gid = gameState.id
                if (gameState.gameClock >= 0) {
                    if (gameState.gameClock >= gameState.duration) {
                        $("#gamephase" + gid).text("New Game, Guess the Lucky Number")
                        this.alertedWinnersLoosers[gid] = false
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
                    var progressParent = (gameState.gameClock / gameState.duration) * 100;
                    $("#timerBar" + gid).css("background-color", "#4caf50")
                    $("#timerBar" + gid).css("width", progressParent + "%")
                } else {
                    $("#timerBar" + gid).css("background-color", "#ff0000")
                    $("#timerBar" + gid).css("width", "100%")
                    $("#timer" + gid).css("display", "none")
                    $("#gamephase" + gid).text("Game Closed")
                    for (let x = 0; x < 10; x++) {
                        $("#submitButton" + gid + x).prop("disabled", true);
                    }
                    $("#goodLuckMessage" + gid).css("display", "none")
                    
                    if (this.inThisRound[gid] && !this.alertedWinnersLoosers[gid] && gameState.winnersCalculated) {
                        this.inThisRound[gid] = false;
                        if (gameState.winners.includes(this.socket.id)) {
                            $('#winnerAlert' + gid).fadeIn(100)
                        } else {
                            $('#looserAlert' + gid).fadeIn(100)
                        }

                        this.alertedWinnersLoosers[gid] = true
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

        this.socket.on("playerDetails", (player: Player) => {
            //console.dir(player)
            this.player = player
            $(".screenName").text(player.screenName.name)
            $(".score").text(player.score)
        })

        this.socket.on("confirmGuess", (gameId: number, guess: number, score: number) => {
            this.inThisRound[gameId] = true
            $("#submitButton" + gameId + (guess - 1)).prop("disabled", true);
            $("#goodLuckMessage" + gameId).css("display", "inline-block")
            $(".score").text(score)
        })

        this.socket.on("chatMessage", (chatMessage: ChatMessage) => {
            if (chatMessage.type === "gameMessage") {
                $("#messages").append("<li><span class='float-left'><span class='circle'>" + chatMessage.from + "</span></span><div class='gameMessage'>" + chatMessage.message + "</div></li>")
            } else {
                $("#messages").append("<li><span class='float-right'><span class='circle'>" + chatMessage.from + "</span></span><div class='otherMessage'>" + chatMessage.message + "</div></li>")
            }
            this.scrollChatWindow()
        })


        $(document).ready(() => {
            $('#resultValue0').addClass('spinner');
            $('#resultValue1').addClass('spinner');
            $('#resultValue2').addClass('spinner');
            $('#resultAlert0').alert().hide()
            $('#resultAlert1').alert().hide()
            $('#resultAlert2').alert().hide()
            $('#winnerAlert0').alert().hide()
            $('#winnerAlert1').alert().hide()
            $('#winnerAlert2').alert().hide()
            $('#looserAlert0').alert().hide()
            $('#looserAlert1').alert().hide()
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
        this.socket.emit("submitGuess", gameId, guess)
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

    public sendMessage() {
        let messageText = $("#messageText").val() as string;
        if (messageText.toString().length > 0) {

            this.socket.emit("chatMessage", <ChatMessage>{ message: messageText, from: this.player.screenName.abbreviation })

            $("#messages").append("<li><span class='float-left'><span class='circle'>" + this.player.screenName.abbreviation + "</span></span><div class='myMessage'>" + messageText + "</div></li>")
            this.scrollChatWindow()

            $("#messageText").val("");
        }
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