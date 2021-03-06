import { getByDisplayValue } from '@testing-library/react';
import React, { useState, useEffect } from 'react'
import './App.css';

const GRID_SIZE = 50
const CELL_SIZE = 20
const SPEED = 100
const MAX_ITERATIONS = 100

let timer = null

const demos = [
  { 
    label: "oscillating lines", 
    cells: [
      [0, 0],[0,-1], [0, 1],[-5, 0],[-5,-1], [-5, 1],[5, 0], [5,-1], [5, 1],
    ]  
  },
  { 
    label: "Penta-decathlon", 
    cells: [
      [0, -5],
      [-1, -4],[0, -4],[1, -4],
      [-2, -3],[-1, -3],[0, -3],[1, -3],[2, -3],

      [-2, 4],[-1, 4],[0, 4],[1, 4],[2, 4],
      [-1, 5],[0, 5],[1, 5],
      [0, 6],

      

    ]  
  },
  { 
    label: "glider", 
    cells: [
      [-15, -15], [-14, -15], [-13, -15],[-13, -16], [-14, -17]
    ]
  },
  { 
    label: "ben ", 
    cells: [
      [0, -7],
      [-1, -6],[0, -6],[1, -6],
      [-2, -5],[-1, -5],[0, -5],[1, -5],[2, -5],

      [-2, 5],[-1, 5],[0, 5],[1, 5],[2, 5],
      [-1, 6],[0, 6],[1, 6],
      [0, 7],

      [-5, 0],
      [-4, -1],[-4, 0],[-4, 1],
      [-3, -2],[-3, -1],[-3, 0],[-3, 1],[-3, 2],

      [3, -2],[3, -1],[3, 0],[3, 1],[3, 2],
      [4, -1],[4, 0],[4, 1],
      [5, 0],
      

    ]  
  }
]



const Grid = ({ children }) => <div className="grid" style={{ width: `${GRID_SIZE * CELL_SIZE}px`, height: `${GRID_SIZE * CELL_SIZE}px` }}>{children}</div>


const Cell = ({ live = false, ...rest }) => <div {...rest} className={'cell' + (live ? ' live' : '')}></div>

const getDefaultState = (cells = null) => ({
  cells: cells || Array.from({ length: GRID_SIZE * GRID_SIZE }).map(() => 0),
  iterations: 0,
  running: false,
  boards: []
})


const doLogic = (cells, index) => {

  const row_index = Math.floor(index / GRID_SIZE)
  const column_index = index % GRID_SIZE
  ///  NW  N  NW
  ///  E   +  W
  ///  SE  S  SW
  const checks = [
    row_index > 1 && column_index > 1 ? index - GRID_SIZE - 1 : undefined, // NW
    row_index > 1 ? index - GRID_SIZE : undefined, // N
    row_index > 1 && column_index < GRID_SIZE ? index - GRID_SIZE + 1 : undefined, // NE

    column_index > 1 ? index - 1 : undefined, // W
    column_index < GRID_SIZE ? index + 1 : undefined, // E

    row_index < GRID_SIZE && column_index > 1 ? index + GRID_SIZE - 1 : undefined, // SW
    row_index < GRID_SIZE ? index + GRID_SIZE : undefined, // S
    row_index < GRID_SIZE && column_index < GRID_SIZE ? index + GRID_SIZE + 1 : undefined, // SE

  ].filter(x => x)


  const live_neighbours = checks.reduce((acc, check_index) => cells[check_index] ? acc + 1 : acc, 0)

  if (cells[index] && [2, 3].indexOf(live_neighbours) > -1) {
    return true
  } else if (!cells[index] && live_neighbours == 3) {
    return true
  } else {
    return false
  }

}




const App = () => {

  const [modelState, setModelState] = useState(getDefaultState())


  const { cells, iterations, running, match } = modelState



  const [boards, setBoards] = useState([])

  const reset = (cells = null) => {
    clearTimeout(timer)
    setModelState(getDefaultState(cells))

  }

  const loadDemo = (demo) => {
    const base_index = Math.floor(GRID_SIZE/2)*GRID_SIZE+Math.round(GRID_SIZE/2)

    let cells = Array.from({ length: GRID_SIZE * GRID_SIZE }).map(() => 0)

    
    reset(demo.reduce((cells, cell) => {
      const index = base_index + (cell[1] * GRID_SIZE) + cell[0]
      console.log({base_index, index, cell})
      return [...cells.slice(0, index -1), 1, ...cells.slice(index)]

    }, cells))



  }

  const toggleCell = (cell_index) => !running && setModelState({ ...modelState, cells: modelState.cells.map((live, index) => cell_index == index ? !live : live) })

  const toggleRunning = () => setModelState({ ...modelState, running: !modelState.running, boards: !modelState.running ? [] : modelState.boards, iterations: !modelState.running ? 0 : modelState.iterations })

  useEffect(() => {
    if (!running || modelState.iterations >= MAX_ITERATIONS || !cells.find((cell) => !!cell)) {
      clearTimeout(timer)
      setModelState({ ...modelState, running: false })
    } else if (running) {
      clearTimeout(timer)
      timer = setTimeout(update, SPEED)

    }

  }, [cells, running])

  const update = () => {
    const new_cells = modelState.cells.map((live, index) => doLogic(cells, index))
    const new_board = new_cells.join(',')
    setModelState({
      ...modelState,
      iterations: modelState.iterations + 1,
      cells: new_cells,
      boards: modelState.boards[modelState.boards.length - 1] != new_board ? [...modelState.boards, new_board] : modelState.boards,
      still: modelState.boards[modelState.boards.length - 1] == new_board,
      match: modelState.boards.indexOf(new_board),
      running: (modelState.boards[modelState.boards.length - 1] == new_board) ? false : modelState.running

    })
  }



  return <>

    {demos.map(demo => <button onClick={() => loadDemo(demo.cells)}>load {demo.label} demo</button>)}
    <br /><br />
    <button onClick={toggleRunning}>{running ? 'stop' : 'start'}</button>
    <button onClick={reset}>reset</button>
    <h1>Iterations: {iterations}</h1>
    <h1>Status: {
      (modelState.still && 'Still') ||
      (!modelState.still && modelState.match > -1 && modelState.match <= modelState.iterations && "Oscillating") ||
      (modelState.running && 'Running') ||
      'Stopped'
    }
    </h1>
    <Grid>{cells.map((live, index) => <Cell onClick={() => toggleCell(index)} key={index} live={live} />)}</Grid>
  </>
}

export default App;