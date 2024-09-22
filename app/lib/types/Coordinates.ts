export type Coordinates = {
    row: number;
    column: number;
};

export type MaybeCoordinates = Coordinates | null;

export function toCoordinates(index: number): Coordinates {
    const row = Math.floor(index / 8);
    const column = index - row * 8;
    return { row, column };
}

export function coordsEqual(a: Coordinates, b: Coordinates) {
    return a.row == b.row && b.column == b.column;
}

export function fromCoordinates(coords: Coordinates): number {
    return coords.row * 8 + coords.column;
}

export function addCoords(a: Coordinates, b: Coordinates): Coordinates {
    return {
        row: a.row + b.row,
        column: a.column + b.column
    };
}

export function scaleCoords(scalar: number, coordinate: Coordinates): Coordinates {
    return {
        row: coordinate.row * scalar,
        column: coordinate.column * scalar
    };
}

export function reverseCoordinates(toReverse: Coordinates): Coordinates {
    return {
        row: 7 - toReverse.row,
        column: toReverse.column
    };
}

export function coordsToString(coords : Coordinates) : string {
    return `${coords.row},${coords.column}`;
}