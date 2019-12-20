interface IPlayer {
    score: number
    screenName: ScreenName
}

export default class Player implements IPlayer {
    private _score: number = 0
    private _screenName: ScreenName

    constructor(screenName: ScreenName) {
        this._screenName = screenName
    }

    public get score(): number {
        return this._score
    }

    public get screenName(): ScreenName {
        return this._screenName
    }

    public get player(): IPlayer {
        return <IPlayer>{ score: this._score, screenName: this._screenName }
    }

    public adjustScore(amount: number) {
        this._score += amount
    }
}
