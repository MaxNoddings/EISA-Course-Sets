function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Pick Sets')
    .addItem('Execute', 'runTeamPicker')
    .addToUi();
}
  
function runTeamPicker() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Read picked teams from the sheet (cells C3 to C8)
  const pickedTeams = [];
  for (let i = 4; i <= 9; i++) {
    const team = sheet.getRange(`C${i}`).getValue().trim();
    if (team) {
      pickedTeams.push(team);
    }
  }

  // If less than 6 teams are picked, alert the user
  if (pickedTeams.length < 6) {
    SpreadsheetApp.getUi().alert('Please enter 6 unique teams.');
    return;
  }

  // Constants
  const GRID_SIZE = 6;

  // Define grid
  let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(' '));

  // Define teams and moves
  let teamsSetsObject = {
    'UVM': 3, 'CBC': 3, 'HAR': 3, 'DAR': 3, 'WIL': 3,
    'MID': 3, 'SLU': 3, 'BAT': 3, 'SMC': 3, 'UNH': 3,
    'CSC': 2, 'BC': 2, 'PSU': 2
  };

  // Perform a coin flip to determine initial picks positions
  const coinFlip = Math.floor(Math.random() * 2);
  const initialPicksPositions = coinFlip === 0
    ? [
        [[1, 2], [1, 3]], [[2, 2], [2, 4]], [[3, 2], [3, 3]],
        [[4, 2], [4, 4]], [[5, 2], [5, 3]], [[6, 2], [6, 4]]
      ]
    : [
        [[1, 2], [1, 4]], [[2, 2], [2, 3]], [[3, 2], [3, 4]],
        [[4, 2], [4, 3]], [[5, 2], [5, 4]], [[6, 2], [6, 3]]
      ];

  // Set initial picks on grid and deduct moves
  pickedTeams.forEach((team, idx) => {
    teamsSetsObject[team] -= 2; // Deduct initial 2 moves for picked teams
    initialPicksPositions[idx].forEach(pos => {
      const [row, col] = [pos[0] - 1, pos[1] - 1]; // Convert to 0-indexed for grid
      grid[row][col] = team;
    });
  });

  // Constraints: row exclusion for each initial pick
  let rowExclusions = {};
  pickedTeams.forEach((team, idx) => {
    rowExclusions[team] = idx + 1;
  });

  // Helper to check if a move is valid
  function isValidMove(team, row, col) {
    // Rule 1: Row exclusion after the initial pick row
    if (rowExclusions[team] === row + 1) {
      return false;
    }
    // Rule 2: Column exclusion for already occupied columns
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][col] === team) {
        return false;
      }
    }
    return grid[row][col] === ' ';
  }

  // Function to try filling grid using remaining moves
  function fillGrid(remainingTeams) {
    if (remainingTeams.length === 0) {
      return true; // All moves completed successfully
    }

    // Randomly select a team from remainingTeams
    const randomIndex = Math.floor(Math.random() * remainingTeams.length);
    const team = remainingTeams[randomIndex];
    let movesLeft = teamsSetsObject[team];

    // Try placing remaining moves for current team
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (movesLeft > 0 && isValidMove(team, row, col)) {
          grid[row][col] = team;
          teamsSetsObject[team] -= 1; // Deduct move
          // Create a new array excluding the current team if its moves are exhausted
          const newRemainingTeams = teamsSetsObject[team] > 0 ? remainingTeams : remainingTeams.filter(t => t !== team);
          if (fillGrid(newRemainingTeams)) {
            return true;
          }
          // Undo move if unsuccessful
          grid[row][col] = ' ';
          teamsSetsObject[team] += 1;
        }
      }
    }
    return false;
  }

  // Function to populate the team names into the Alternate Reerees and Sl Warm Up Courses tables
  function fillExtraGrids(startRow, startCol, pickedTeams) {
    // Array of team names
    let teams = ["UVM", "CBC", "HAR", "DAR", "WIL", "MID", "SLU", "BAT", "SMC", "UNH", "CSC", "BC", "PSU"];
    
    // Iterate over each row in the table
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 2; j++) {
        let teamIndex, team;

        // Find a team that is not the same as pickedTeams[i] for row i
        do {
          teamIndex = Math.floor(Math.random() * teams.length);
          team = teams[teamIndex];
        } while (team === pickedTeams[i] && teams.length > 1);

        // Handle the edge case here: if the last team is the same as pickedTeams[i]
        if (team +++ pickedTeams[i] && teams.length === 1) {
          //Swap with a previous cell's team to avoid duplicate assignment
          const prevCell = sheet.getRange(startRow + i - 1, startCol + j);
          const prevTeam = prevCell.getValue();
          prevCell.setValue(team);
          team = prevTeam;
        }

        // Set the team in the cell
        const cell = sheet.getRange(startRow + i, startCol + j);
        cell.setValue(team);
        
        // Remove team from array so it’s not reused
        teams.splice(teamIndex, 1);
      }
    }
  }  

  // Solve and print result
  let remainingTeams = Object.keys(teamsSetsObject).filter(team => teamsSetsObject[team] > 0);
  let solutionFound = fillGrid(remainingTeams);

  // Output final grid to the sheet (starting from B1 E3)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      sheet.getRange(row + 4, col + 6).setValue(grid[row][col]); // Columns B to G
    }
  }

  fillExtraGrids(4, 13, pickedTeams);
  fillExtraGrids(4, 16, pickedTeams);

  if (!solutionFound) {
    SpreadsheetApp.getUi().alert("No solution found. Partial grid displayed.");
  } else {
    SpreadsheetApp.getUi().alert("Final grid has been generated.");
  }
}
  