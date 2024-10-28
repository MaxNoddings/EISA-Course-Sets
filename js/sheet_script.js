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
    for (let i = 3; i <= 8; i++) {
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
    const TOTAL_TEAMS = 13;
  
    // Define grid
    let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(' '));
  
    // Define teams and moves
    let teams = {
      'UVM': 3, 'CBC': 3, 'HAR': 3, 'DAR': 3, 'WIL': 3,
      'MID': 3, 'SLU': 3, 'BAT': 3, 'SMC': 3, 'UNH': 3,
      'CSC': 2, 'BC': 2, 'PSU': 2
    };
  
    // Set initial picks on grid and deduct moves
    pickedTeams.forEach((team, idx) => {
      teams[team] -= 2; // Deduct initial 2 moves for picked teams
      const initialPicksPositions = [
        [[1, 2], [1, 3]], [[2, 2], [2, 4]], [[3, 2], [3, 3]],
        [[4, 2], [4, 4]], [[5, 2], [5, 3]], [[6, 2], [6, 4]]
      ];
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
      let movesLeft = teams[team];
  
      // Try placing remaining moves for current team
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (movesLeft > 0 && isValidMove(team, row, col)) {
            grid[row][col] = team;
            teams[team] -= 1; // Deduct move
            // Create a new array excluding the current team if its moves are exhausted
            const newRemainingTeams = teams[team] > 0 ? remainingTeams : remainingTeams.filter(t => t !== team);
            if (fillGrid(newRemainingTeams)) {
              return true;
            }
            // Undo move if unsuccessful
            grid[row][col] = ' ';
            teams[team] += 1;
          }
        }
      }
      return false;
    }
  
    // Solve and print result
    let remainingTeams = Object.keys(teams).filter(team => teams[team] > 0);
    let solutionFound = fillGrid(remainingTeams);
  
    // Output final grid to the sheet (starting from B1 E3)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        sheet.getRange(row + 4, col + 6).setValue(grid[row][col]); // Columns B to G
      }
    }
  
    if (!solutionFound) {
      SpreadsheetApp.getUi().alert("No solution found. Partial grid displayed.");
    } else {
      SpreadsheetApp.getUi().alert("Final grid has been generated.");
    }
  }
  