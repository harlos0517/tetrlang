# Tetrlang compiler

## Tetrlang code format
The Tetrlang code is composed of three parts:
`board:order:operations`
### Board
`board` consists of rows from bottom to top, separated by commas.
You indicate the garbage holes with column numbers 0 to 9 for each row: `1356`
- For consecutive holes, you can use range: `4-8`.
  if starting from first column, left side can be omitted: `-8`
  if ending at last column, right side can be omitted: `4-`
  usually you wouldn't need it, but use `-` to indicate empty lines.
- Omit everything if the row is same as the previous row (below)
  This is very useful for wells and clean garbage.
  e.g. Centered 4-wide well is `3-6,,,,,,,,`.
  Tip: N rows of clean garbage or well with height N comes with N commas.
- Simply omit all if the board is empty.
Example: `0,,,,4,,,,345,45,4-79,124-79,124-`
### Order
`order` is a sequence of pieces in the order they are spawned.
- Default available pieces are I, J, L, O, S, T, Z.
- If you want to specify the pieces in operations, you can omit this part.
- You can also specify initial hold piece by prepending the piece and `|`.
Example: `I|JLSOTTZI`, `JLSOTTZI`
### Operations
`operations` is a sequence of operations to perform on the board.
- Each piece is separated by `;`, which implictly indicates a lock (space).
- If order was not provided, the first operation must be a piece.
- If order was provided, the optional `|` at the beginning indicates a hold (shift).
- rotation: r (clockwise), z (counterclockwise), a (180 flip)
- movement: `<` (left), `>` (right), `[` (left to side), `]` (right to side)
- drop: `.` (fall / one step down), `_` (soft drop to bottom)
Example: (order provided) `>r;_]_z;|<<;|[>_z;`
Example: (order not provided) `I>r;S_]_z;O<<;|Z[>_z;`
### Full working examples
- no order provided: `2,,,,-1,-2,,,-3::Jr[;Tr[;S[r_r;Z[_r;`
- order provided:  `2,,,,-1,-2,,,-3:S|JTLZ:r[;r[;|[r_r;[_r;`
- Perfect Clear Opening: `:I|TSZILJOTSZ:r[;_[;[;];r>>;z];]<;z>;;z_z<;`

## spec
```
col = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
connector = '-'
row_sep = ','
hold = '/'
sep = ':'
piece = 'I' | 'J' | 'L' | 'O' | 'S' | 'Z' | 'T'
rotate = 'o' | 'r' | 'a' | 'z'
move = '[' | '<' | '>' | ']' | '.' | '_'
lock = ';'
range = col connector col
range_begin = connector col
range_end = col connector
all_col = connector
row = (range | col)+ | (range_begin (range | col)*) | ((range | col)* range_end) | all_col
board = row (row_sep row?)*
order = piece hold piece+
op_with_order = hold? move* lock
op_no_order = piece move* lock
tetrio_operations = board? sep (order sep op_with_order* | sep op_no_order*)
```

# todo
- [x] clear line visualization
- [x] ghost piece visualization
- [x] add key handling visualization
- [x] adjust format to allow omitting some parameters
- [x] dynamic delay for different operations
- [x] spin indicator
- [ ] settings preset
- [ ] aesthetics redesign
