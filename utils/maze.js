let walls;

export function recursiveDivisionMaze(grid) {

    let vertical = range(grid[0].length);
    let horizontal = range(grid.length);

    walls = [];
    getRecursiveWalls(vertical, horizontal, grid);

    return walls;

}

function range(len) {

    let result = [];

    for (let i = 0; i < len; i++) {
        result.push(i);
    }

    return result;

}

function getRecursiveWalls(vertical, horizontal, grid) {

    if (vertical.length < 2 || horizontal.length < 2) return;

    // NOTE: dir === 0 => Horizontal
    // NOTE: dir === 1 => Vertical
    let dir;
    let num;

    if (vertical.length > horizontal.length) {
        dir = 0;
        num = generateOddRandomNumber(vertical);
    }

    if (vertical.length <= horizontal.length) {
        dir = 1;
        num = generateOddRandomNumber(horizontal);
    }

    if (dir === 0) {

        addWall(dir, num, vertical, horizontal);

        getRecursiveWalls(vertical.slice(0, vertical.indexOf(num)), horizontal, grid);

        getRecursiveWalls(vertical.slice(vertical.indexOf(num) + 1), horizontal, grid);

    } else {

        addWall(dir, num, vertical, horizontal);

        getRecursiveWalls(vertical, horizontal.slice(0, horizontal.indexOf(num)), grid);

        getRecursiveWalls(vertical, horizontal.slice(horizontal.indexOf(num) + 1), grid);

    }

}

function generateOddRandomNumber(array) {

    let max = array.length - 1;

    let randomNum = Math.floor(Math.random() * (max / 2)) + Math.floor(Math.random() * (max / 2));

    if (randomNum % 2 === 0) {

        if (randomNum === max) randomNum -= 1;
        else randomNum += 1;

    }

    return array[randomNum];

}

function addWall(dir, num, vertical, horizontal) {
    let tempWalls = [];

    if (dir === 0) {

        if (horizontal.length === 2) return;

        for (let temp of horizontal) {

            tempWalls.push([temp, num]);

        }

    } else {

        if (vertical.length === 2) return;

        for (let temp of vertical) {

            tempWalls.push([num, temp]);

        }

    }

    tempWalls.splice(generateRandomNumber(tempWalls.length), 1);

    for (let wall of tempWalls) {
        walls.push(wall);
    }

}

function generateRandomNumber(max) {

    let randomNum = Math.floor(Math.random() * (max / 2)) + Math.floor(Math.random() * (max / 2));

    if (randomNum % 2 !== 0) {

        if (randomNum === max) randomNum -= 1;
        else randomNum += 1;

    }

    return randomNum;

}