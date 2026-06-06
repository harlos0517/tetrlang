import { createContext } from 'react'
import type { TetrisSession } from 'tetrlang-core'

interface TetrlangEditorContextProps {
  boardCode: string
  setBoardCode: (code: string) => void
  orderCode: string
  setOrderCode: (code: string) => void
  operationCode: string
  setOperationCode: (code: string) => void
  session: TetrisSession | null
}

const TetrlangEditorContext = createContext<TetrlangEditorContextProps>({
  boardCode: '',
  setBoardCode: () => {},
  orderCode: '',
  setOrderCode: () => {},
  operationCode: '',
  setOperationCode: () => {},
  session: null,
})

export default TetrlangEditorContext
