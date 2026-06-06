import { Code, List, Table, Text, Title } from '@mantine/core'

const TetrlangUsage = () => <>
  <Title order={2}>Tetrlang Language</Title>
  <Text>Code format: <Code>board:order:operations</Code></Text>

  <Title order={3}>Board</Title>
  <Text>
    Rows from bottom to top, separated by commas.
    Column numbers <Code>0–9</Code> mark garbage holes.
  </Text>
  <List>
    <List.Item>
      Range: <Code>4-8</Code> (cols 4–8), <Code>-8</Code> (0–8),{' '}
      <Code>4-</Code> (4–9)
    </List.Item>
    <List.Item>Repeat previous row: omit the row (empty between commas)</List.Item>
    <List.Item>Empty board: omit entirely</List.Item>
  </List>
  <Code block>0,,,,4,,,,345,45,4-79,124-79,124-</Code>

  <Title order={3}>Order</Title>
  <Text>
    Piece sequence in spawn order. Prepend a piece and <Code>|</Code> to
    set the initial hold.
  </Text>
  <Code block>{'ILJSOTTZ      # no initial hold\nI|JLSOTTZI    # initial hold: I'}</Code>

  <Title order={3}>Operations</Title>
  <Text>
    Separated by <Code>;</Code> (implicit lock/hard drop).
    If order is omitted, prepend the piece to each operation.
  </Text>
  <Table>
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Token</Table.Th>
        <Table.Th>Action</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {[
        ['r', 'rotate clockwise'],
        ['z', 'rotate counterclockwise'],
        ['a', '180° flip'],
        ['<', 'move left'],
        ['>', 'move right'],
        ['[', 'move to left wall'],
        [']', 'move to right wall'],
        ['.', 'fall one row'],
        ['_', 'soft drop to bottom'],
        ['|', 'hold (shift)'],
      ].map(([token, action]) => (
        <Table.Tr key={token}>
          <Table.Td><Code>{token}</Code></Table.Td>
          <Table.Td>{action}</Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
  <Code block>{
    '# with order\n>r;_]_z;|<<;|[>_z;\n\n# without order\nI>r;S_]_z;O<<;|Z[>_z;'
  }</Code>

  <Title order={3}>Full Examples</Title>
  <Code block>{
    '# no order\n2,,,,-1,-2,,,-3::Jr[;Tr[;S[r_r;Z[_r;\n\n' +
            '# with order\n2,,,,-1,-2,,,-3:S|JTLZ:r[;r[;|[r_r;[_r;\n\n' +
            '# Perfect Clear Opening\n:I|TSZILJOTSZ:r[;_[;[;];r>>;z];]<;z>;;z_z;'
  }</Code>
</>

export default TetrlangUsage
