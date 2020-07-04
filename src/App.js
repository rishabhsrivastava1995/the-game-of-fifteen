import React, {useState} from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import {Button, AppBar, Toolbar, Typography, Container, Slider, Snackbar} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

import './App.css';

const getMarks = (min, max) => {
  let marks = [];
  for(let index = min; index <= max; ++index) {
    marks.push({
      value: index,
      label: `${index}x${index}`
    });
  }
  return marks;
}

const [UP, DOWN, LEFT, RIGHT] = [0, 1, 2, 3];

function App() {
  const [ state, setState ] = useState({
    minBoxSize: 3,
    boxSize: 3,
    maxBoxSize: 10,
    time: 0,
    sliderDisabled: false,
    startDisabled: false,
    stopDisabled: true,
    board: null,
    emptyRow: 0,
    emptyCol: 0,
    timer: null,
    gameCompleted: false,
    gameCompletionTime: '',
  });
  const { 
    minBoxSize, boxSize, maxBoxSize,
    time, timer,
    sliderDisabled, startDisabled, stopDisabled,
    board, emptyRow, emptyCol,
    gameCompleted, gameCompletionTime
  } = state;
  
  const gameCompletionProps = (board) => {
    let count = 0;
    board.forEach((rows, rowIndex) => {
      rows.forEach((cell, colIndex) => {
        if(rowIndex * boxSize + colIndex + 1 === cell)
          ++count;
      });
    });
    if(count === boxSize * boxSize - 1) {
      clearTimeout(timer);
      setTimeout(() => {
        setState(state => {
          return {
            ...state,
            gameCompleted: false,
          }
        })
      }, 5000)
      return {
        sliderDisabled: false,
        stopDisabled: true,
        startDisabled: false,
        gameCompleted: true,
        gameCompletionTime: timeFormatter(time),
        time: 0,
        timer: null
      }
    }
    return {}
  }

  const swapUp = () => {
    let gameBoard = JSON.parse(JSON.stringify(board));
    let row = emptyRow;
    let col = emptyCol;
    gameBoard[row-1][col] = gameBoard[row-1][col]^gameBoard[row][col]^(gameBoard[row][col]=gameBoard[row-1][col]);
    --row;
    setState(state => {
      return {
        ...state,
        board: gameBoard,
        emptyRow: row,
        ...gameCompletionProps(gameBoard)
      }
    });
  }
  
  const swapDown = () => {
    let gameBoard = JSON.parse(JSON.stringify(board));
    let row = emptyRow;
    let col = emptyCol;
    gameBoard[row+1][col] = gameBoard[row+1][col]^gameBoard[row][col]^(gameBoard[row][col]=gameBoard[row+1][col]);
    ++row;
    setState(state => {
      return {
        ...state,
        board: gameBoard,
        emptyRow: row,
        ...gameCompletionProps(gameBoard)
      }
    });
  }
  
  const swapLeft = () => {
    let gameBoard = JSON.parse(JSON.stringify(board));
    let row = emptyRow;
    let col = emptyCol;
    gameBoard[row][col-1] = gameBoard[row][col-1]^gameBoard[row][col]^(gameBoard[row][col] = gameBoard[row][col-1]);
    --col;
    setState(state => {
      return {
        ...state,
        board: gameBoard,
        emptyCol: col,
        ...gameCompletionProps(gameBoard)
      }
    });
  }
  
  const swapRight = () => {
    let gameBoard = JSON.parse(JSON.stringify(board));
    let row = emptyRow;
    let col = emptyCol;
    gameBoard[row][col+1] = gameBoard[row][col+1]^gameBoard[row][col]^(gameBoard[row][col] = gameBoard[row][col+1]);
    ++col;
    setState(state => {
      return {
        ...state,
        board: gameBoard,
        emptyCol: col,
        ...gameCompletionProps(gameBoard)
      }
    });
  }

  const getInitializeBoardConfig = () => {
    let board = Array(boxSize);
    let row = boxSize - 1;
    let col = boxSize - 1;

    for(let i=0; i<boxSize; ++i)
      board[i] = Array(boxSize);

    for(let i = boxSize*boxSize-1; i>=0; --i)
      board[boxSize - Math.floor(i/boxSize)-1][boxSize-i%boxSize-1] = i;

    if(boxSize%2 === 0) {
        board[boxSize-1][boxSize-3] = 1;
        board[boxSize-1][boxSize-2] = 2;
    }

    const swapUp = () => {
      board[row-1][col] = board[row-1][col]^board[row][col]^(board[row][col]=board[row-1][col]);
      --row;
    }
  
    const swapDown = () => {
      board[row+1][col] = board[row+1][col]^board[row][col]^(board[row][col]=board[row+1][col]);
      ++row;
    }
  
    const swapLeft = () => {
      board[row][col-1] = board[row][col-1]^board[row][col]^(board[row][col] = board[row][col-1]);
      --col;
    }
  
    const swapRight = () => {
      board[row][col+1] = board[row][col+1]^board[row][col]^(board[row][col] = board[row][col+1]);
      ++col;
    }
        
    for(let i=0; i<boxSize * boxSize * boxSize * boxSize; ++i)
    {
      const direction = Math.floor(4*Math.random());
      if(direction === UP) {
        if(row-1 !== -1)
            swapUp();
        else
            swapDown();
      }
      else if(direction === DOWN) {
        if(row+1 !== boxSize)
            swapDown();
        else
            swapUp();
      }
      else if(direction === LEFT) {
        if(col-1 !== -1)
            swapLeft();
        else
            swapRight();
      }
      else if(direction === RIGHT) {
        if(col+1 !== boxSize)
            swapRight();
        else
            swapLeft();
      }
    }

    return [board, row, col];
  }

  const onStartClicked = (event) => {
    const [board, row, col] = getInitializeBoardConfig();
    setState(state => {
      return {
        ...state,
        sliderDisabled: true,
        stopDisabled: false,
        startDisabled: true,
        timer: setInterval(() => {
          setState(state => {
            return {
              ...state,
              time: state.time + 1
            }
          });
        }, 1000),
        board: board,
        emptyRow: row,
        emptyCol: col
      }
    });
  }
  const onStopClicked = (event) => {
    clearInterval(timer);
    setState(state => {
      return {
        ...state,
        sliderDisabled: false,
        stopDisabled: true,
        startDisabled: false,
        time: 0,
        timer: null
      }
    })
  };

  const timeFormatter = (time) => {
    const seconds = time%60;
    const minutes = Math.floor(time/60)%60;
    const hours = Math.floor(time/3600);
    const strSeconds = `${seconds}`.padStart(2, '0');
    const strMinutes = `${minutes}`.padStart(2, '0');
    const strHours = `${hours}`.padStart(2, '0');
    return `${strHours}:${strMinutes}:${strSeconds}`;
  };
  const onSliderChange = (event, newBoxSize) => {
    setState(state => {
      return {
        ...state,
        boxSize: newBoxSize
      };
    });
  };

  const onButtonClick = (row, col) => {
    if(emptyCol === col-1 && row === emptyRow)
      swapRight();
    else if(emptyCol === col+1 && row === emptyRow)
      swapLeft();
    else if(emptyRow === row-1 && col === emptyCol)
      swapDown();
    else if(emptyRow === row+1 && col === emptyCol)
      swapUp();
  }

  const marks = getMarks(minBoxSize, maxBoxSize);
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit">
            The Game of Fifteen
          </Typography>
        </Toolbar>
      </AppBar>

      <Container style={{ marginTop: 20 }}>
        <Container maxWidth="xs">
          <Typography variant="h6" color="inherit">
            Choose your square size
          </Typography>
          <Slider disabled={sliderDisabled}
            min={minBoxSize}
            max={maxBoxSize}
            defaultValue={boxSize}
            step={1}
            aria-labelledby="discrete-slider-custom"
            valueLabelDisplay="auto"
            marks={marks}
            onChange={onSliderChange}
          />
        </Container>
        <Container maxWidth="xs">
          <Button color="primary" disabled={startDisabled} onClick={onStartClicked}>
            <PlayArrowIcon/>Start
          </Button>
          <Button color="primary" disabled={stopDisabled} onClick={onStopClicked}>
            <StopIcon/>Stop
          </Button>
          Time: {timeFormatter(time)}
        </Container>
        <Container style={{marginTop: 20}}>
          {
            !sliderDisabled 
            ?
            <Typography variant="h6" color="inherit">
              A {boxSize}x{boxSize} grid will be initialized when you start the game
            </Typography>
            :
            board.map((rows, rowIndex) =>
              <Container key={rowIndex}> 
                {
                  rows.map((cell, colIndex) => {
                    const buttonProps={};
                    if(cell !== 0) 
                      buttonProps['variant'] = 'contained';
                    if(rowIndex * boxSize + colIndex + 1 === cell)
                      buttonProps['color'] = 'primary';
                    const buttonText = cell === 0 ? ' ' : `${cell}`;
                    return (
                      <Button 
                        key={`${rowIndex}.${colIndex}.${cell}`}
                        {...buttonProps} 
                        onClick={() => onButtonClick(rowIndex, colIndex)}>
                         {buttonText}
                      </Button>
                    )
                  })
                }
              </Container>
            )
          }
        </Container>
      </Container>

      <Snackbar open={gameCompleted} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success">
          Congrats! You beat the game in {gameCompletionTime}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
