import { Box, Button, Code, Divider, Group, Slider, Stack, Text, TextInput, Title } from '@mantine/core'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { useEffect, useMemo, useState } from 'react'
import { TetrisSession, parseTetrlang } from 'tetrlang-core'

import TetrlangEditorContext from '../context/TetrlangEditorContext'
import { END_DELAY_RATIO, FRAME_DELAY_MAP } from '../utils/constants'
import SVGWithContext from './SVGWithContext'
import TetrlangFrame from './TetrlangFrame'
import TetrlangUsage from './TetrlangUsage'

const TetrlangEditor = () => {
  const windowHash = window.location.hash
  const hashTetrlang = windowHash.startsWith('#')
    ? decompressFromEncodedURIComponent(windowHash.slice(1))
    : ''
  const [initialBoardCode, initialOrderCode, initialOperationCode] = hashTetrlang
    ? hashTetrlang.split(':')
    : ['', 'I|TSZILJOTSZ', 'r[;_[;[;];r>>;z];]<;z>;;z_z;']

  const [boardCode, setBoardCode] = useState(initialBoardCode || '')
  const [orderCode, setOrderCode] = useState(initialOrderCode || '')
  const [operationCode, setOperationCode] = useState(initialOperationCode || '')

  const { session, frameCount, error } = useMemo(() => {
    try {
      const compiled = parseTetrlang(`${boardCode}:${orderCode}:${operationCode}`)
      const s = new TetrisSession(compiled)
      s.generate(compiled)
      return { session: s, frameCount: s.states.length, error: null }
    } catch(e) {
      const msg = e instanceof Error ? e.message : String(e)
      return {
        session: null,
        frameCount: 0,
        error: 'Failed to parse Tetrlang code: ' + msg,
      }
    }
  }, [boardCode, orderCode, operationCode])

  const tetrlang = useMemo(
    () => `${boardCode}:${orderCode}:${operationCode}`,
    [boardCode, orderCode, operationCode],
  )
  const hash = compressToEncodedURIComponent(tetrlang)
  window.history.replaceState(null, '', `#${hash}`)

  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(10)

  useEffect(() => {
    if (!playing) return

    const delayRatio = frameIndex === frameCount - 1
      ? END_DELAY_RATIO
      : FRAME_DELAY_MAP[session?.states[frameIndex]?.operation || 'init'] || 1
    const delay = 1000 * delayRatio / speed
    const timeout = setTimeout(() => {
      setFrameIndex(i => (i + 1) % frameCount)
    }, delay)

    return () => clearTimeout(timeout)
  }, [playing, frameCount, session, frameIndex, speed])

  return <TetrlangEditorContext.Provider value={{
    boardCode,
    setBoardCode,
    orderCode,
    setOrderCode,
    operationCode,
    setOperationCode,
    session,
  }}>
    <Group h="100vh">
      <Box flex="1" h="100vh">
        <SVGWithContext>
          <TetrlangFrame state={session?.states[frameIndex]} />
        </SVGWithContext>
      </Box>
      <Box flex="1" p="md" h="100vh" style={{ overflowY: 'auto' }}>
        <Stack>
          <Title order={1}>Tetrlang Editor</Title>
          <Text>Create and share Tetris setups, solutions and animated replays.</Text>
          <TextInput
            label="Board Code"
            value={boardCode}
            onChange={e => {
              const filtered = e.currentTarget.value.replace(/[^0-9-]/g, '')
              setBoardCode(filtered)
            }}
          />
          <TextInput
            label="Order Code"
            value={orderCode}
            onChange={e => {
              const filtered = e.currentTarget.value.replace(/[^I|TSZLJO]/g, '')
              setOrderCode(filtered)
            }}
          />
          <TextInput
            label="Operation Code"
            value={operationCode}
            onChange={e => {
              const filtered = e.currentTarget.value.replace(/[^I|TSZLJOrza<>[\]_.;]/g, '')
              setOperationCode(filtered)
            }}
          />
          {error && <Box c="red">{error}</Box>}
          <Slider
            label="Frame"
            min={0}
            max={frameCount - 1}
            value={frameIndex}
            onChange={setFrameIndex}
          />
          <Button onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Slider
            label="Speed"
            min={1}
            max={16}
            value={speed}
            onChange={setSpeed}
          />
          <TextInput
            label="Full Tetrlang Code"
            value={tetrlang}
            onChange={e => {
              const value = e.currentTarget.value
              const parts = value.split(':')
              setBoardCode(parts[0] || '')
              setOrderCode(parts[1] || '')
              setOperationCode(parts[2] || '')
            }}
          />
          <Button onClick={() => {
            navigator.clipboard.writeText(tetrlang)
          }}>
            Copy Tetrlang Code
          </Button>
          <Code>
            {`${import.meta.env.VITE_HOST}#${hash}`}
          </Code>
          <Button onClick={() => {
            navigator.clipboard.writeText(`${import.meta.env.VITE_HOST}#${hash}`)
          }}>
            Copy Share URL
          </Button>

          <Divider mt="md" />

          <TetrlangUsage />
        </Stack>
      </Box>
    </Group>
  </TetrlangEditorContext.Provider>
}

export default TetrlangEditor
