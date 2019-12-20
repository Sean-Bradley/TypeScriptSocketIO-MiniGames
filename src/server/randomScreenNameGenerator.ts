export default class randomScreenNameGenerator {
    private animals = ['Cat', 'Dog', 'Bird', 'Tiger', 'Giraffe', 'Elephant', 'Koala', 'Bee', 'Fly', 'Fish', 'Frog'];
    private colours = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];

    constructor() {
    }

    public generateRandomScreenName() {
        let colour = this.colours[Math.floor(Math.random() * this.colours.length)]
        let animal = this.animals[Math.floor(Math.random() * this.animals.length)]

        let screenName: ScreenName = { name: colour + " " + animal, abbreviation: colour[0] + animal[0] }

        return screenName
    }
}