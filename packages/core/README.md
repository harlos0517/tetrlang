# tetrlang-core

Parser, compiler, and simulation engine for the Tetrlang language.

Zero dependencies.

## Install

```bash
npm install tetrlang-core
```

## Usage

```ts
import { parseTetrlang, TetrisSession } from 'tetrlang-core'

const compiled = parseTetrlang(':ILJSZ:r[;_]_z;[;]<;')
const session = new TetrisSession(compiled)
session.generate(compiled) // generate states

console.log(session.states.length)  // number of frames
console.log(session.currentState) // final TetrisState
```

## API

### `parseTetrlang(code: string): Compiled`

Parses a Tetrlang string into a structured `Compiled` object. Throws on invalid input.

### `TetrisSession`

Runs the simulation from a `Compiled` input and stores each intermediate state.

```ts
const session = new TetrisSession(compiled)
session.generate(compiled)
// session.states: TetrisState[]
// session.currentState: final state
```

### `TetrisState`

A single immutable frame of the game. Key fields:

| Field | Type | Description |
|---|---|---|
| `grid` | `Grid` | 40×10 board (index 0 = bottom) |
| `piece` | `PIECE \| null` | current active piece |
| `position` | `Position` | `[x, y]` of active piece |
| `rotation` | `ROTATION` | current rotation state |
| `hold` | `PIECE \| null` | held piece |
| `next` | `PIECE[]` | upcoming pieces |
| `clearingLines` | `number[]` | rows cleared on this frame |
| `spin` | `boolean \| 'mini' \| null` | spin detection result |
| `combo` | `number` | current combo count |
| `b2b` | `number` | back-to-back count |

## Tetrlang Language

Code format: `board:order:operations`

### Board

Rows from bottom to top, separated by commas. Column numbers `0–9` mark garbage holes.

- Range: `4-8` (columns 4 to 8), `-8` (0 to 8), `4-` (4 to 9)
- Repeat previous row: omit the row (empty between commas)
- Empty board: omit entirely

```
0,,,,4,,,,345,45,4-79,124-79,124-
```

### Order

Piece sequence in spawn order. Prepend a piece and `|` to set the initial hold.

```
ILJSOTTZ      # no initial hold
I|JLSOTTZI    # initial hold: I
```

### Operations

Separated by `;` (implicit lock/hard drop). If order is omitted, prepend the piece to each operation.

| Token | Action |
|---|---|
| `r` | rotate clockwise |
| `z` | rotate counterclockwise |
| `a` | 180° flip |
| `<` | move left |
| `>` | move right |
| `[` | move to left wall |
| `]` | move to right wall |
| `.` | fall one row |
| `_` | soft drop to bottom |
| `\|` | hold (shift) |

```
# with order
>r;_]_z;|<<;|[>_z;

# without order
I>r;S_]_z;O<<;|Z[>_z;
```

### Full examples

```
# no order
2,,,,-1,-2,,,-3::Jr[;Tr[;S[r_r;Z[_r;

# with order
2,,,,-1,-2,,,-3:S|JTLZ:r[;r[;|[r_r;[_r;

# Perfect Clear Opening
:I|TSZILJOTSZ:r[;_[;[;];r>>;z];]<;z>;;z_z;
```
