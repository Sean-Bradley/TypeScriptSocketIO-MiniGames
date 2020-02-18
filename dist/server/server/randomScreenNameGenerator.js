"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class randomScreenNameGenerator {
    constructor() {
        this.animals = ['Cat', 'Dog', 'Bird', 'Tiger', 'Giraffe', 'Elephant', 'Koala', 'Bee', 'Fly', 'Fish', 'Frog'];
        this.colours = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];
    }
    generateRandomScreenName() {
        let colour = this.colours[Math.floor(Math.random() * this.colours.length)];
        let animal = this.animals[Math.floor(Math.random() * this.animals.length)];
        let screenName = { name: colour + " " + animal, abbreviation: colour[0] + animal[0] };
        return screenName;
    }
}
exports.default = randomScreenNameGenerator;
//# sourceMappingURL=randomScreenNameGenerator.js.map