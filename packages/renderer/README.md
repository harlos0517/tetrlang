# tetrlang-renderer

Canvas frame renderer and GIF generator for [tetrlang-core](https://www.npmjs.com/package/tetrlang-core).

## Install

```bash
npm install tetrlang-renderer tetrlang-core
```

Requires Node.js >= 18. Uses [`canvas`](https://github.com/Automattic/node-canvas) and [`sharp`](https://sharp.pixelplumbing.com/) as native dependencies.

## Usage

### Generate a GIF

```ts
import { parseTetrlang, TetrisSession } from 'tetrlang-core'
import { generateGif } from 'tetrlang-renderer'

const compiled = parseTetrlang(':ILJSZ:r[;_]_z;[;]<;')
const session = new TetrisSession(compiled)
session.generate(compiled)

// Returns Buffer
const buffer = await generateGif(session, { delay: 200 })

// Or write to file
await generateGif(session, { delay: 200 }, 'output.gif')
```

### Render a single frame

```ts
import { TetrisState, PIECE, ROTATION, LOCK } from 'tetrlang-core'
import { createFrame } from 'tetrlang-renderer'
import sharp from 'sharp'

const state = session.states.at(-1)
const canvas = createFrame(state)
await sharp(canvas.toBuffer('image/png')).toFile('frame.png')
```

## API

### `generateGif(session, options?, outputPath?): Promise<Buffer | OutputInfo>`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `session` | `TetrisSession` | — | simulated session from tetrlang-core |
| `options.delay` | `number` | `200` | base frame delay in ms |
| `options.withStep` | `boolean` | `false` | show individual movement steps |
| `outputPath` | `string` | — | if provided, writes to file and returns `sharp.OutputInfo`; otherwise returns `Buffer` |

### `createFrame(state: TetrisState): Canvas`

Renders a single game state into a canvas. Returns a [node-canvas](https://github.com/Automattic/node-canvas) `Canvas` object.
