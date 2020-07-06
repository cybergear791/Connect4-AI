
import React from 'react';

let uniqueSeed = 0;
function nextUniqueKey() {
    return uniqueSeed += 1;
}

const NUM_ROWS = 6, NUM_COLUMNS = 7;

class Cell extends React.Component {

    render() {
        return (
            <td onClick={() => this.props.handleClick(this.props.colIdx)} 
                width="50px" height="50px">
                <img src={require("./images/" + this.props.cell.color + ".png")} alt="moves"/>
            </td>
        )
    }
}

class Row extends React.Component {

    render() {
        return (
            <tr>{this.props.row.map( (cell, idx) =>
                <Cell key={nextUniqueKey()} cell={cell}
                      handleClick={this.props.handleClick} colIdx={idx} />) }</tr>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        let board = Array(NUM_ROWS).fill(Array(NUM_COLUMNS).fill({color: "white", isOccupied: false}));
        board = board.map((row, rowIdx) => row.map( (col, colIdx) => {
            return {...board[rowIdx][colIdx], row: rowIdx, column: colIdx }
        }));
        this.state = {
            board
        };
        this.positionOfDisks = Array(NUM_COLUMNS).fill(NUM_ROWS - 1);
        this.move_counter = 0;
        this.handleClick = this.handleClick.bind(this);
        this.reset = this.reset.bind(this);
    }

    doWeHaveAWinnerThatIncludes(board, rowIdx, colIdx, winningPlayer, player, depth, checkTie) {
        const doWeHaveAWinnerDownward = (rowIdx, colIdx, color) => {
            let matchingCells = [{row: rowIdx, column: colIdx}];
            rowIdx += 1;
            while(rowIdx < NUM_ROWS && board[rowIdx][colIdx].color === color ) {
                matchingCells.push({row: rowIdx, column: colIdx});
                rowIdx += 1;
            }
            return matchingCells.length >= 4 ? true : false;
        };

        const doWehaveAWinnerSideways = (rowIdx, colIdx, color) => {
            let matchingCells = [{row: rowIdx, column: colIdx}];
            let leftColIdx = colIdx - 1;
            while(leftColIdx >= 0 && board[rowIdx][leftColIdx].color === color ) {
                matchingCells.push({row: rowIdx, column: leftColIdx});
                leftColIdx -= 1;
            }

            let rightColIdx = colIdx + 1;
            while(rightColIdx < NUM_COLUMNS && board[rowIdx][rightColIdx].color === color ) {
                matchingCells.push({row: rowIdx, column: rightColIdx});
                rightColIdx += 1;
            }

            return matchingCells.length >= 4 ? true : false;
        };

        const dowWeHaveAWinnerOnRightDiagonal = (rowIdx, colIdx, color) => {
            let matchingCells = [{row: rowIdx, column: colIdx}];

            let downRowIdx = rowIdx + 1;
            let downColIdx = colIdx + 1;
            while (downRowIdx < NUM_ROWS && downColIdx < NUM_COLUMNS &&
            board[downRowIdx][downColIdx].color === color) {
                matchingCells.push({row: downRowIdx, column: downColIdx});
                downRowIdx += 1;
                downColIdx += 1;

            }

            let upRowIdx = rowIdx - 1;
            let upColIdx = colIdx - 1;
            while (upRowIdx >= 0 && upColIdx >= 0 &&
            board[upRowIdx][upColIdx].color === color) {
                matchingCells.push({row: upRowIdx, column: upColIdx});
                upRowIdx -= 1;
                upColIdx -= 1;
            }

            return matchingCells.length >= 4 ? true : false;
        };

        const dowWeHaveAWinnerOnLeftDiagonal = (rowIdx, colIdx, color) => {
            let matchingCells = [{row: rowIdx, column: colIdx}];

            let downRowIdx = rowIdx + 1;
            let downColIdx = colIdx - 1;
            while (downRowIdx < NUM_ROWS && downColIdx >= 0 &&
            board[downRowIdx][downColIdx].color === color) {
                matchingCells.push({row: downRowIdx, column: downColIdx});
                downRowIdx += 1;
                downColIdx -= 1;

            }

            let upRowIdx = rowIdx - 1;
            let upColIdx = colIdx + 1;
            while (upRowIdx >= 0 && upColIdx < NUM_COLUMNS &&
            board[upRowIdx][upColIdx].color === color) {
                matchingCells.push({row: upRowIdx, column: upColIdx});
                upRowIdx -= 1;
                upColIdx += 1;

            }

            return matchingCells.length >= 4 ? true : false;
        };

        if (player === "yellow")
            player = "red";
        else
            player = "yellow";
        
        if( doWeHaveAWinnerDownward(rowIdx, colIdx, player) || doWehaveAWinnerSideways(rowIdx, colIdx, player) ||
        dowWeHaveAWinnerOnLeftDiagonal(rowIdx, colIdx, player) || dowWeHaveAWinnerOnRightDiagonal(rowIdx, colIdx, player) ) 
        {   
            if(player === "yellow")
                winningPlayer.win = 100 - depth; // '- depth' to choose a move that will lead to a sooner win.
            else
                winningPlayer.win = -100 + depth;
            return true;
        }
        

        if(checkTie){
            for (let i = 0; i < board.length; i++)
                for (let j = 0; j < board[i].length; j++)
                    if (board[i][j].color === "white")
                        return false;
            winningPlayer.win = 0;
            return true;
        }
        return false;
    }

    deepCopyFunction (inObject){
        if (typeof inObject !== "object" || inObject === null) {
            return inObject;
        }

        let value, key;
        let outObject = []
    
        for (key in inObject) {
            value = inObject[key];
            outObject[key] = this.deepCopyFunction(value);
        }
    
        return outObject;
    }

    // Orders successors in order of likely optimal move (middle-most move), in order to optimize alpha-beta pruning.
    bestMove_Order(successors){
        let new_successors = [];
        let len = successors.length;
        let middleIdx = Math.floor(len/2);

        for (let j = 0; j < len; j++){
            if( j % 2 === 0)
                middleIdx = middleIdx + j;
            else
                middleIdx = middleIdx - j
            new_successors[j] = successors[middleIdx];
        }
        return new_successors;
    }

    // Returns an array filled with different boards with every possible move 'playersturn' can move.
    Successors(board, playersturn)
    {
        let successors = [];

        for (let i = 0; i < 7; i++)
        {
            let temp = this.deepCopyFunction(board);
            if (temp[5][i].color === "white"){
                temp[5][i].color = playersturn;
                successors.push([temp, 5, i]);
            }
            else{
                let w = 4
                while(w > -1){
                    if (temp[w][i].color === "white"){
                        temp[w][i].color = playersturn;
                        successors.push([temp, w, i]);
                        break;
                    }
                    else
                        w--;
                }
            }
        }
        return successors;
    }   
    
    Alpha_Beta(board, rowIdx, colIdx, alpha, beta, depth, player)
    {        
        // When reaches a leaf node.
        let winningPlayer = {win: 0};
        if (this.doWeHaveAWinnerThatIncludes(board, rowIdx, colIdx, winningPlayer, player, depth, true) || depth === 7 ){
            return [winningPlayer.win, [board, rowIdx, colIdx]];
        }

        let successors = this.bestMove_Order(this.Successors(board, player));
        let bestBoard = [board, rowIdx, colIdx];

        if (player === "yellow"){
            let result_value = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < successors.length; i++){
                
                let value = this.Alpha_Beta(successors[i][0], successors[i][1], successors[i][2], alpha, beta, depth + 1, "red")[0];
                
                if (value > result_value){
                    result_value = value;
                    bestBoard = successors[i];
                }

                alpha = Math.max(alpha, value);
                if (beta <= alpha)
                    break;
                
            }
            return [result_value, bestBoard];
        }
        else{
            let result_value = Number.POSITIVE_INFINITY;
            for (let i = 0; i < successors.length; i++){
                
                let value = this.Alpha_Beta(successors[i][0], successors[i][1], successors[i][2], alpha, beta, depth + 1, "yellow")[0];
                
                if (value < result_value){
                    result_value = value;
                    bestBoard = successors[i];
                }

                beta = Math.min(beta, value);
                if (beta <= alpha)
                    break;
            }
            return [result_value, bestBoard];
        }
    }

    handleClick(colIdx) {
        if( this.state.haveAWinner )
            return;

        let rowIdx = this.positionOfDisks[colIdx];

        if( rowIdx <  0)
            return;

        this.move_counter += 1;
        this.positionOfDisks[colIdx] -= 1;

        let theRow = this.state.board[rowIdx].slice();
        theRow[colIdx] = {color: "red", isOccupied: true, row: rowIdx, column: colIdx};

        let newBoard = this.state.board.slice();
        newBoard[rowIdx] = theRow;

        this.setState({
            board: newBoard
        });

        let winningPlayer = {};
        this.doWeHaveAWinnerThatIncludes(newBoard, rowIdx, colIdx, winningPlayer, "yellow", 0, false);
        if( winningPlayer.win < 0 ) {
            this.setState({
                haveAWinner: true,
                winnerColor: "Red",
            });
        }
        else{
            // AI's Turn
            console.log("AI Thinking...");

            let bestBoard = this.Alpha_Beta(newBoard, rowIdx, colIdx, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0, "yellow")
        
            this.positionOfDisks[bestBoard[1][2]] -= 1;

            newBoard[bestBoard[1][1]][bestBoard[1][2]] = {color: "yellow", isOccupied: true, row: bestBoard[1][1], column: bestBoard[1][2]};    

            this.setState({
                board: newBoard
            });

            let winningPlayer = {};
            this.doWeHaveAWinnerThatIncludes(newBoard, bestBoard[1][1], bestBoard[1][2], winningPlayer, "red", 0, false);
            if( winningPlayer.win > 0) {
                this.setState(
                {
                    haveAWinner: true,
                    winnerColor: "AI"
                });
            }
            console.log("AI Moved");
        }
    }

    reset() {
            let board = Array(NUM_ROWS).fill(Array(NUM_COLUMNS).fill({color: "white", isOccupied: false}));
            board = board.map((row, rowIdx) => row.map( (col, colIdx) => {
                return {...board[rowIdx][colIdx], row: rowIdx, column: colIdx }
            }));
            this.move_counter = 0;
            this.positionOfDisks = Array(NUM_COLUMNS).fill(NUM_ROWS - 1);
            this.setState({
                board,
                haveAWinner: false
            });
    }

    topMessage() {
        if( ! this.state.haveAWinner) {
            if(this.move_counter === 21) {
                return <div style={{height: "50px", textAlign: "center"}}>
                    <p align="center"> Tied. Game Over.
                            <br/>
                            <button onClick={this.reset}>Reset?
                            </button>
                    </p>
                    </div>
            }
            return <div style={{height: "50px", textAlign: "center"}}>
                <p top-margin="100px">Connect 4<br/> You are Red. Computer is Yellow.</p>
                <br/>
                </div>;
        }

        const winnerColor = this.state.winnerColor.charAt(0).toUpperCase() + this.state.winnerColor.slice(1);
        return <div style={{height: "50px", align: "center"}}>
                    <p align="center"> {winnerColor === "Red" ? "You Win" : "Computer Wins"}. Game Over.
                        <br/>
                        <button onClick={this.reset}>Reset?
                        </button>
                    </p>
               </div>
    };

    render() {
        return (
            <div>
                {
                    this.topMessage()
                }
            <table border="1" align="center">
                <tbody>
                {
                    this.state.board.map((row, idx) =>
                            <Row key={nextUniqueKey()}
                                 handleClick={this.handleClick} row={row} />)
                }
                </tbody>
            </table>
                <div><p></p></div>
            </div>
        );
    }
}

export default Game;
