# Tetrlang compiler

```yaml
- operation
  - piece: `IJLOSZT` # omitted when order is provided
  - lock: '_'
  - hold: `/` # used when order is provided
  - rotate: `xrac` # x can be omited
  - move: `<>[]` # brackets means to the very side
  - gravity: `.` # deal with midway spin
  - softdrop: `+`
- board: garbage hole (column 0-9)
  - comma separated rows
  - from bottom to top
  - if same as row below, omit (preserve comma)
  - trailing comma
```

# example
- no order provided
```
2,,,,-1,-2,,,-3::Jr[;Tr[;S[r_r;Z[_r;
```

- order provided
```
2,,,,-1,-2,,,-3:S|JTLZ:r[;r[;|[r_r;[_r;
```

- PCO
```
:I|TSZILJOTSZ:r[;_[;[;];r>>;z];]<;z>;;z_z<;
```

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
