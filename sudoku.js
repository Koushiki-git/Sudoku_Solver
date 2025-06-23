
"use strict";

var SudokuSolver = (function() {
  // Sample puzzles
  var PUZZLES = {
    easy: "1-58-2----9--764-52--4--819-19--73-6762-83-9-----61-5---76---3-43--2-5-16--3-89--",
    medium: "-3-5--8-45-42---1---8--9---79-8-61-3-----54---5------78-----7-2---7-46--61-3--5--",
    hard: "8----------36------7--9-2---5---7-------457-----1---3---1----68--85---1--9----4--"
  };

  // Set this variable to true to publicly expose otherwise private functions
  var TESTABLE = true;

  // PUBLIC FUNCTIONS
  function solve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsInvalid(boardArray)) {
      return false;
    }
    return recursiveSolve(boardString);
  }

  function solveAndPrint(boardString) {
    var solvedBoard = solve(boardString);
    console.log(toString(solvedBoard.split("")));
    return solvedBoard;
  }

  function getPuzzle(difficulty) {
    return PUZZLES[difficulty] || PUZZLES.easy;
  }

  // PRIVATE FUNCTIONS
  function recursiveSolve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsSolved(boardArray)) {
      return boardArray.join("");
    }
    var cellPossibilities = getNextCellAndPossibilities(boardArray);
    var nextUnsolvedCellIndex = cellPossibilities.index;
    var possibilities = cellPossibilities.choices;
    for (var i = 0; i < possibilities.length; i++) {
      boardArray[nextUnsolvedCellIndex] = possibilities[i];
      var solvedBoard = recursiveSolve(boardArray.join(""));
      if (solvedBoard) {
        return solvedBoard;
      }
    }
    return false;
  }

  function boardIsInvalid(boardArray) {
    return !boardIsValid(boardArray);
  }

  function boardIsValid(boardArray) {
    return allRowsValid(boardArray) && allColumnsValid(boardArray) && allBoxesValid(boardArray);
  }

  function boardIsSolved(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        return false;
      }
    }
    return true;
  }

  function getNextCellAndPossibilities(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        var existingValues = getAllIntersections(boardArray, i);
        var choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(function (num) {
          return existingValues.indexOf(num) < 0;
        });
        return { index: i, choices: choices };
      }
    }
  }

  function getAllIntersections(boardArray, i) {
    return getRow(boardArray, i).concat(getColumn(boardArray, i)).concat(getBox(boardArray, i));
  }

  function allRowsValid(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72].map(function (i) {
      return getRow(boardArray, i);
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  function getRow(boardArray, i) {
    var startingEl = Math.floor(i / 9) * 9;
    return boardArray.slice(startingEl, startingEl + 9);
  }

  function allColumnsValid(boardArray) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
      return getColumn(boardArray, i);
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  function getColumn(boardArray, i) {
    var startingEl = Math.floor(i % 9);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (num) {
      return boardArray[startingEl + num * 9];
    });
  }

  function allBoxesValid(boardArray) {
    return [0, 3, 6, 27, 30, 33, 54, 57, 60].map(function (i) {
      return getBox(boardArray, i);
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  function getBox(boardArray, i) {
    var boxCol = Math.floor(i / 3) % 3;
    var boxRow = Math.floor(i / 27);
    var startingIndex = boxCol * 3 + boxRow * 27;
    return [0, 1, 2, 9, 10, 11, 18, 19, 20].map(function (num) {
      return boardArray[startingIndex + num];
    });
  }

  function collectionIsValid(collection) {
    var numCounts = {};
    for(var i = 0; i < collection.length; i++) {
      if (collection[i] != "-") {
        if (numCounts[collection[i]] === undefined) {
          numCounts[collection[i]] = 1;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  function toString(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72].map(function (i) {
      return getRow(boardArray, i).join(" ");
    }).join("\n");
  }

  // Expose public methods
  if (TESTABLE) {
    return { 
      solve: solve,
      solveAndPrint: solveAndPrint,
      getPuzzle: getPuzzle,
      recursiveSolve: recursiveSolve,
      boardIsInvalid: boardIsInvalid,
      boardIsValid: boardIsValid,
      boardIsSolved: boardIsSolved,
      getNextCellAndPossibilities: getNextCellAndPossibilities,
      getAllIntersections: getAllIntersections,
      allRowsValid: allRowsValid,
      getRow: getRow,
      allColumnsValid: allColumnsValid,
      getColumn: getColumn,
      allBoxesValid: allBoxesValid,
      getBox: getBox,
      collectionIsValid: collectionIsValid,
      toString: toString
    };
  } else {
    return { 
      solve: solve,
      solveAndPrint: solveAndPrint,
      getPuzzle: getPuzzle
    };
  }
})();

// Sudoku Generator
var SudokuGenerator = (function() {
  // Generate a complete valid Sudoku board
  function generateCompleteBoard() {
    var emptyBoard = "-------------------------------------------------".split("");
    return SudokuSolver.solve(emptyBoard.join(""));
  }

  // Remove numbers from a complete board to create a puzzle
  function generatePuzzle(difficulty) {
    var completeBoard = generateCompleteBoard();
    var puzzle = completeBoard.split("");
    var cellsToRemove;
    
    // Determine number of cells to remove based on difficulty
    switch(difficulty) {
      case "easy":
        cellsToRemove = 40;  // Leaves 41 clues
        break;
      case "medium":
        cellsToRemove = 50;  // Leaves 31 clues
        break;
      case "hard":
        cellsToRemove = 60;  // Leaves 21 clues
        break;
      default:  // random
        cellsToRemove = 40 + Math.floor(Math.random() * 20);  // Between 40-60
    }
    
    // Randomly remove cells while ensuring the puzzle remains solvable
    var removedIndices = [];
    while (removedIndices.length < cellsToRemove) {
      var randomIndex = Math.floor(Math.random() * 81);
      if (puzzle[randomIndex] !== "-") {
        var temp = puzzle[randomIndex];
        puzzle[randomIndex] = "-";
        
        // Check if the puzzle still has a unique solution
        var tempBoard = puzzle.join("");
        var solution = SudokuSolver.solve(tempBoard);
        if (solution && solution === completeBoard) {
          removedIndices.push(randomIndex);
        } else {
          puzzle[randomIndex] = temp;  // Revert if not unique solution
        }
      }
    }
    
    return puzzle.join("");
  }

  return {
    generatePuzzle: generatePuzzle
  };
})();
