const readline = require('readline');

// Constants
const GRID_SIZE = 6;
const TOTAL_TEAMS = 13;

// Define grid
let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(' '));

// Define teams and moves
let teams = {
    'UVM': 3, 'CBC': 3, 'HAR': 3, 'DAR': 3,
    'WIL': 3, 'MID': 3, 'SLU': 3, 'BAT': 3,
    'SMC': 3, 'UNH': 3, 'CSC': 2, 'BC': 2, 'PSU': 2
};

// Create interface for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get user input for picked teams
function getPickedTeams(callback) {
    let pickedTeams = [];
    const askTeam = (i) => {
        if (i < 6) {
            rl.question(`Enter the name of picked team ${i + 1} (e.g., UVM, SMC,..., DAR): `, (team) => {
                if (!teams.hasOwnProperty(team) || pickedTeams.includes(team)) {
                    console.log('Invalid team. Please enter a unique team name.');
                    askTeam(i); // Ask again
                } else {
                    pickedTeams.push(team);
                    askTeam(i + 1); // Move to next team
                }
            });
        } else {
            callback(pickedTeams);
        }
    };
    askTeam(0);
}

// Initial picks and their corresponding positions
const initialPicksPositions = [
    [[1, 2], [1, 3]],
    [[2, 2], [2, 4]],
    [[3, 2], [3, 3]],
    [[4, 2], [4, 4]],
    [[5, 2], [5, 3]],
    [[6, 2], [6, 4]]
];

// Get picked teams from user input
getPickedTeams(pickedTeams => {
    // Set initial picks on grid and deduct moves
    pickedTeams.forEach((team, idx) => {
        teams[team] -= 2; // Deduct initial 2 moves for picked teams
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

    // Function to print grid
    function printGrid(grid) {
        grid.forEach(row => console.log(row.join(" ")));
        console.log();
    }

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
    console.log("Initial Grid after picks:");
    printGrid(grid);

    // Start solving from remaining teams
    let remainingTeams = Object.keys(teams).filter(team => teams[team] > 0);
    let solutionFound = fillGrid(remainingTeams);

    console.log(solutionFound ? "Final Grid:" : "No solution found. Partial grid:");
    printGrid(grid);

    // Close readline interface
    rl.close();
});
