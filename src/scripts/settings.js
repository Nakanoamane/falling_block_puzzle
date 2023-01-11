export const fieldX = 10;
export const fieldY = 20;
export const overY = 2;

export const minoSettings = {
    T: [[1, 1], [0, 1], [2, 1], [1, 0]],
    Z: [[1, 1], [1, 0], [0, 0], [2, 1]],
    L: [[2, 1], [1, 1], [2, 0], [0, 1]],
    O: [[1, 0], [2, 0], [1, 1], [2, 1]],
    S: [[1, 1], [1, 0], [0, 1], [2, 0]],
    I: [[0, 1], [1, 1], [2, 1], [3, 1]],
    J: [[0, 1], [1, 1], [2, 1], [0, 0]]
}
export const minos = Object.keys(minoSettings);

export const speedMax = 10;
export const speedMin = 1;
export const dropSpeed = 1000;
