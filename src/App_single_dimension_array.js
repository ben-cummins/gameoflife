import React, { useState, useEffect} from 'react'
import './App.css';

const GRID_SIZE = 50
const CELL_SIZE = 20
const SPEED = 100

let timer = null

const Grid = ({children}) => <div className="grid" style={{width: `${GRID_SIZE*CELL_SIZE}px`, height: `${GRID_SIZE*CELL_SIZE}px`}}>{children}</div>


const Cell = ({live = false, ...rest}) => <div {...rest} className={'cell' + (live ?' live':'')}></div>

const getDefaultState = () => ({
  cells: Array.from({length: GRID_SIZE*GRID_SIZE}).map(() => 0),
  iterations: 0,
  running: false
})

const App = () => {

  const [modelState, setModelState] = useState(getDefaultState())
    
  console.log({modelState})


  const {cells, iterations, running} = modelState


  const reset = () => {
    clearTimeout(timer)
    setModelState(getDefaultState())

  }

  const toggleCell = (cell_index) => {
    setModelState({...modelState, cells: modelState.cells.map((live, index) => cell_index == index ? !live : live)})
  }

  const stopstart = () => {
    setModelState({...modelState, running: !modelState.running})
    if (running) {
      clearTimeout(timer)

    }
  }

  const doLogic = index => {
    let checks = []

    if (Math.floor(index / GRID_SIZE) > 1) {
      // N
      checks.push(index -GRID_SIZE)
    }

    if (Math.floor(index / GRID_SIZE) < GRID_SIZE - 1) {
      // S
      checks.push(index + GRID_SIZE)
    }

    if (index % GRID_SIZE > 1) {
      // W
      checks.push(index -1)

      if (Math.floor(index / GRID_SIZE) > 1) {
        // SW
        checks.push(index -GRID_SIZE - 1)
      }

      if (Math.floor(index / GRID_SIZE) < GRID_SIZE - 1) {
        // NW
        checks.push(index + GRID_SIZE - 1)
      }
  
    }
    if (index % GRID_SIZE > 0) {
      // E
      checks.push(index + 1)
      // SE
      if (Math.floor(index / GRID_SIZE) > 1) {
        // SW
        checks.push(index -GRID_SIZE + 1)
      }

      if (Math.floor(index / GRID_SIZE) < GRID_SIZE - 1) {
        // NW
        checks.push(index + GRID_SIZE + 1)
      }

  
    }

    const live_neighbours = checks.reduce((acc, check_index) => cells[check_index] ? acc+1 : acc, 0 )

    
    
    if (cells[index] && (live_neighbours == 2 || live_neighbours == 3)) {
      return true
    } else if (!cells[index] && live_neighbours == 3) {
      return true
    } else {
      return false  
    }

  }

  useEffect(() => {
    if (modelState.iterations < 100 && running && cells.find((cell)=> !!cell)) {
      clearTimeout(timer)
      timer = setTimeout(update, SPEED)

    }

  }, [cells, running])

  const update = () => { 

      const new_cells = modelState.cells.map((live, index) => doLogic(index))

      const new_state = {
        ...modelState, 
        iterations: modelState.iterations+1, 
        cells: new_cells,
        
      }
      
      setModelState(new_state)

    

  }

  return cells && <>

        <button onClick={stopstart}>{running ? 'stop' : 'start'}</button>
        <button onClick={reset}>reset</button>
        <h1>Iterations: {iterations}</h1>
          <Grid>{cells.map((live, index) => <Cell onClick={() => toggleCell(index)} key={index} live={live} />)}</Grid>

          
        </> || <div> loading?</div>;


}

export default App;