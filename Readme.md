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
2,,,,-1,-2,,,-3,:Jr[_Tr[_S[r+r_Z[+r_
```

- order provided
```
2,,,,-1,-2,,,-3,S/JTLZ:r[_r[_/[r+r_[+r_
```

- PCO
```
I/TSZILJOTSZ:r[_+[_[_]_r>>_c]_]<_c>__c+c<_
```

## spec
```
col = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
connector = '-'
row_sep = ','
hold = '/'
start = ':'
piece = 'I' | 'J' | 'L' | 'O' | 'S' | 'Z' | 'T'
rotate = 'x' | 'r' | 'a' | 'c'
move = '[' | '<' | '>' | ']' | '.' | '+'
lock = '_'
range = col connector col
range_begin = connector col
range_end = col connector
row = range_begin? (range | col)* range_end?
board = (row row_sep)*
order = piece hold piece+
op_with_order = hold? move* lock
op_no_order = piece move* lock
tetrio_operations = board (order start op_with_order* | start op_no_order*)
```

# todo
- [x] clear line visualization
- [ ] ghost piece visualization
- [ ] add key handling visualization
- [ ] adjust format to allow omitting some parameters
- [ ] aesthetics redesign
- [ ] dynamic delay for different operations
- [ ] settings preset
- [ ] spin indicator
