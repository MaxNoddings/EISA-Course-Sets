import itertools

# Constants
GRID_SIZE = 6
TOTAL_TEAMS = 13

# Define grid
grid = [[' ' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]

# Define teams and moves
# 10 teams with 3 moves, 3 teams with 2 moves
teams = {f'Team_{i+1}': 3 if i < 10 else 2 for i in range(TOTAL_TEAMS)}

# Initial picks and their corresponding positions
initial_picks_positions = [
    [(1, 2), (1, 3)],
    [(2, 2), (2, 4)],
    [(3, 2), (3, 3)],
    [(4, 2), (4, 4)],
    [(5, 2), (5, 3)],
    [(6, 2), (6, 4)]
]

# Get team names in order for the first 6 picks
# picked_teams = list(teams.keys())[:6]  # First 6 teams picked
picked_teams = list(teams.keys())[6:12]
for idx, team in enumerate(picked_teams):
    teams[team] -= 2  # Deduct initial 2 moves for picked teams
    for pos in initial_picks_positions[idx]:
        row, col = pos[0] - 1, pos[1] - 1  # Convert to 0-indexed for grid
        grid[row][col] = team

# Constraints: row exclusion for each initial pick
row_exclusions = {team: row + 1 for row, team in enumerate(picked_teams)}

# Function to print grid
def print_grid(grid):
    for row in grid:
        print(" ".join(row))
    print()

# Helper to check if a move is valid
def is_valid_move(team, row, col):
    # Rule 1: Row exclusion after the initial pick row
    if row_exclusions.get(team) == row:
        return False
    # Rule 2: Column exclusion for already occupied columns
    for r in range(GRID_SIZE):
        if grid[r][col] == team:
            return False
    return grid[row][col] == ' '

# Function to try filling grid using remaining moves
def fill_grid(remaining_teams):
    if not remaining_teams:
        return True  # All moves completed successfully

    team = remaining_teams[0]
    moves_left = teams[team]
    
    # Try placing remaining moves for current team
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if moves_left > 0 and is_valid_move(team, row, col):
                grid[row][col] = team
                teams[team] -= 1  # Deduct move
                if fill_grid(remaining_teams if teams[team] > 0 else remaining_teams[1:]):
                    return True
                # Undo move if unsuccessful
                grid[row][col] = ' '
                teams[team] += 1

    return False

# Solve and print result
print("Initial Grid after picks:")
print_grid(grid)

# Start solving from remaining teams
remaining_teams = [team for team in teams if teams[team] > 0]
solution_found = fill_grid(remaining_teams)

print("Final Grid:" if solution_found else "No solution found. Partial grid:")
print_grid(grid)
