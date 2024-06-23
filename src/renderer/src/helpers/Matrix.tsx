/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef } from 'react'

// CONFIG

const WIDTH = 2000
const HEIGHT = 2000

const COLUMN_WIDTH = 20
const COLUMNS = WIDTH / COLUMN_WIDTH

const ROW_HEIGHT = 26
const ROWS = HEIGHT / ROW_HEIGHT

const RAINDROP_SPAWN_RATE = 0.8

const MATRIX_CHARACTERS = [
    'ﾊ',
    'ﾐ',
    'ﾋ',
    'ｰ',
    'ｳ',
    'ｼ',
    'ﾅ',
    'ﾓ',
    'ﾆ',
    'ｻ',
    'ﾜ',
    'ﾂ',
    'ｵ',
    'ﾘ',
    'ｱ',
    'ﾎ',
    'ﾃ',
    'ﾏ',
    'ｹ',
    'ﾒ',
    'ｴ',
    'ｶ',
    'ｷ',
    'ﾑ',
    'ﾕ',
    'ﾗ',
    'ｾ',
    'ﾈ',
    'ｽ',
    'ﾀ',
    'ﾇ',
    'ﾍ',
    'ｦ',
    'ｲ',
    'ｸ',
    'ｺ',
    'ｿ',
    'ﾁ',
    'ﾄ',
    'ﾉ',
    'ﾌ',
    'ﾔ',
    'ﾖ',
    'ﾙ',
    'ﾚ',
    'ﾛ',
    'ﾝ',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '7',
    '8',
    '9',
    'Z',
    '*',
    '+',
    '-',
    '<',
    '>',
    '+',
    '-',
    '<',
    '>',
    '¦',
    '|',
    'ç',
    'ﾘ',
    'ｸ'
] as const

const GREENS = ['#15803d', '#16a34a', '#22c55e', '#4ade80'] as const

const YELLOWS = ['#80ff3d', '#a3ff4a', '#c5ff5e', '#deff80'] as const

const REDS = ['#ff803d', '#ff003d', '#ff003e', '#ff1d3e'] as const

const WHITE = '#f0fdf4'

const FRAME_RATE = 1000 / 20

// TYPES

type Greens = (typeof GREENS)[number]

type Yellows = (typeof YELLOWS)[number]

type Reds = (typeof REDS)[number]

type Color = typeof WHITE | Greens | Yellows | Reds

type Cell = {
    /**
     * The position / index of the cell within the column. Used
     * to determine what the next cell in the column is.
     */
    position: number

    /**
     * The amount of ticks the cell will be active / part of a raindrop.
     *
     * If the `activeFor` is 5 this means that for five ticks the
     * cell will be shown on the matrix. It will also get a new color
     * and char when `activeFor` is greater than zero.
     *
     * Each tick decreases `activeFor` by one.
     */
    activeFor: number

    /**
     * The character / symbol of the cell.
     *
     * The `char` will change when `retainChar` is `0`.
     */
    char: string

    /**
     * The number of ticks to retain the 'char' for.
     */
    retainChar: number

    /**
     * The color the cell has, will be WHITE when head, and a
     * GREENS when in the trail.
     *
     * The `color` will change when `retainChar` is `0`.
     */
    color: Color

    /**
     * The number of ticks to retain the 'color' for.
     */
    retainColor: number
}

type Column = {
    /**
     * The cells that make up this column.
     */
    cells: Cell[]

    /**
     * The cell which is currently the head of the raindrop.
     * When it is `undefined` it means that the head of the raindrop
     * is not on the screen, but it could still have a trail.
     */
    head?: Cell

    /**
     * The length of the current raindrop's trail.
     *
     * Each raindrop is assigned a new random trail.
     */
    trail: number

    /**
     * The number of ticks left in the current raindrops animation.
     */
    ticksLeft: number

    /**
     * The speed factor of the raindrop. The lower the number the higher
     * the speed.
     *
     * Each raindrop is assigned a new random speed.
     */
    speed: number
}

type Matrix = Column[]

// The implementation

export function MatrixRainV12(props: { useYellow?: boolean; useRed?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current

            const ctx = canvas.getContext('2d')

            ctx && (ctx.font = '32px mono')

            const matrix: Matrix = createMatrix()

            const intervalId = window.setInterval(() => {
                tick(matrix, props.useYellow, props.useRed)

                ctx && render(matrix, ctx, props.useYellow, props.useRed)
            }, FRAME_RATE)

            return () => {
                window.clearInterval(intervalId)
            }
        }
        return () => { }
    }, [props.useYellow, props.useRed])

    useEffect(() => {
        function resizeCanvas() {
            if (canvasRef.current) {
                const width = Math.min(WIDTH, document.body.clientWidth - 16)

                canvasRef.current.style.width = `${width}px`
            }
        }

        window.addEventListener('resize', resizeCanvas)

        resizeCanvas()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [])

    return (
        <div className="flex justify-center">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="mb-4">
                The rain effect of the "Matrix" film
            </canvas>
        </div>
    )
}

function render(
    matrix: Matrix,
    ctx: CanvasRenderingContext2D,
    yellow?: boolean,
    red?: boolean
): void {
    ctx.fillStyle = 'rgb(0,16,0)'
    yellow && (ctx.fillStyle = 'rgb(16,16,0)')
    red && (ctx.fillStyle = 'rgb(16,0,0)')
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    let x = 0
    for (const column of matrix) {
        let y = ROW_HEIGHT
        for (const cell of column.cells) {
            ctx.fillStyle = cell.color
            ctx.fillText(cell.char, x, y)

            y += ROW_HEIGHT
        }

        x += COLUMN_WIDTH
    }
}

// Keep track of the number of ticks made, this is used to determine
// the speed of a column.
const tickNo = 0

function tick(matrix: Matrix, yellow?: boolean, red?: boolean): void {
    for (const column of matrix) {
        // Move to the next column if the current column should not tick.
        // This will give raindrops different speeds.
        if (tickNo % column.speed !== 0) {
            continue
        }

        // Spawn a raindrop every once in a while, when there is no
        // trail. As the animation should only repeat runs after the
        // complete raindrop is no longer on screen.
        const animationComplete = column.ticksLeft <= 0

        if (animationComplete && Math.random() > RAINDROP_SPAWN_RATE) {
            // Some drops are really quite long!
            column.trail = randomNumberBetween(3, ROWS * 2)

            // The animation is done once the HEAD has moved through all
            // ROWS, and when the trail has moved past all ROWS.
            column.ticksLeft = ROWS + column.trail

            // Manually vetted these speeds, 1 feels nice and fast,
            // and 6 can just barely be followed along.
            column.speed = randomNumberBetween(1, 6)

            column.head = column.cells[0]

            column.head.char = randomChar()

            // By setting `activeFor` to the column.trail, the first cell
            // will be visible for that many ticks.
            column.head.activeFor = column.trail
        } else {
            if (column.head) {
                const nextCell = column.cells[column.head.position + 1]

                // If there is a next cell we are not at the end of the screen.
                if (nextCell) {
                    column.head = nextCell

                    nextCell.activeFor = column.trail
                } else {
                    column.head.char = ''
                    column.head = undefined
                }
            }

            column.ticksLeft -= 1
        }

        for (const cell of column.cells) {
            if (cell.activeFor > 0) {
                if (column.head === cell) {
                    // Make head white and update it the next tick
                    cell.color = WHITE
                    cell.retainColor = 0

                    // Always give the head a random char
                    cell.char = randomChar()
                    cell.retainChar = randomNumberBetween(1, 10)
                } else {
                    if (cell.retainColor <= 0) {
                        cell.color = randomGreen()
                        yellow && (cell.color = randomYellow())
                        red && (cell.color = randomRed())
                        cell.retainColor = randomNumberBetween(1, 10)
                    } else {
                        cell.retainColor -= 1
                    }

                    if (cell.retainChar <= 0) {
                        cell.char = randomChar()
                        cell.retainChar = randomNumberBetween(1, 10)
                    } else {
                        cell.retainChar -= 1
                    }
                }

                cell.activeFor -= 1
            } else {
                cell.char = ''
            }
        }
    }
}

function createMatrix(): Matrix {
    const columns: Column[] = []

    for (let i = 0; i < COLUMNS; i++) {
        const cells: Cell[] = []

        for (let j = 0; j < ROWS; j++) {
            const cell: Cell = {
                position: j,
                activeFor: 0,
                char: '',
                retainChar: 0,
                color: WHITE,
                retainColor: 0
            }

            cells.push(cell)
        }

        columns.push({
            cells,
            head: undefined,
            trail: 0,
            ticksLeft: 0,
            speed: 2
        })
    }

    return columns
}

// Utils

function randomChar(): string {
    return randomFromArray(MATRIX_CHARACTERS)
}

function randomGreen(): Greens {
    return randomFromArray(GREENS)
}

function randomYellow(): Yellows {
    return randomFromArray(YELLOWS)
}

function randomRed(): Reds {
    return randomFromArray(REDS)
}

function randomFromArray<T>(array: readonly T[]): T {
    const random = Math.floor(Math.random() * array.length)

    return array[random]
}

function randomNumberBetween(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min) + min)
}
