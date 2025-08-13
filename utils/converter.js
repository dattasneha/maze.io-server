let mazeArray;

export function createMazeArray(numRows, numCols, maze) {
    mazeArray = Array.from({ length: numRows }, () => Array(numCols).fill(0));

    maze.forEach(([row, col]) => {
        if (row < numRows && col < numCols) {
            mazeArray[row][col] = 1;
        }

    });

    return mazeArray;
}