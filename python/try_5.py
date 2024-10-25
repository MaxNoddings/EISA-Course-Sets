import time

# Constants
TIMEOUT_SECONDS = 100
MAX_SOLUTIONS = 5
GRID_SIZE = 6
TOTAL_TEAMS = 13

# Initialize the grid and teams
grid = [[' ' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
teams = {f'Team_{i+1}': 3 if i < 10 else 2 for i in range(TOTAL_TEAMS)}  # 10 teams with 3 moves, 3 teams with 2 moves
unique_solutions = set()
start_time = time.time()

# Initial pick positions for the 6 teams
initial_picks_positions = [
    [(1, 2), (1, 3)], [(2, 2), (2, 4)], [(3, 2), (3, 3)],
    [(4, 2), (4, 4)], [(5, 2), (5, 3)], [(6, 2), (6, 4)]
]

# Helper function to print the grid
def print_grid(grid):
    for row in grid:
        print(' '.join(row))
    print("\n")

# Check for timeout
def is_timed_out():
    return time.time() - start_time > TIMEOUT_SECONDS

# Ensure that each move follows the game's rules
def is_valid_move(team, row, col):
    if grid[row][col] != ' ':  # Grid space must be empty
        return False

    # Row restriction: no moves on the row below the initial pick row
    for idx, pick_team in enumerate(picked_teams):
        pick_row = initial_picks_positions[idx][0][0] - 1  # 0-index row of initial pick
        if team == pick_team and row == pick_row + 1:
            return False

    # Column restriction: no moves in the same column already used by the team
    for r in range(GRID_SIZE):
        if grid[r][col] == team:
            return False

    return True

# Save unique solution
def save_solution_if_unique():
    solution_tuple = tuple(tuple(row) for row in grid)  # Convert grid to tuple of tuples
    if solution_tuple not in unique_solutions:
        unique_solutions.add(solution_tuple)
        print(f"Unique Solution {len(unique_solutions)}:")
        print_grid(grid)
        return True
    return False

# Recursive backtracking function to fill grid with unique solutions
def fill_grid_with_unique_solutions(remaining_teams, depth=0):
    # Only check timeout every 100 recursive calls to avoid constant checking
    if depth % 100 == 0 and is_timed_out():
        return True  # Stop if timed out or maximum solutions found

    if not remaining_teams:
        # Complete solution found, attempt to save if unique
        return save_solution_if_unique()

    team = remaining_teams[0]
    moves_left = teams[team]
    
    # Try placing remaining moves for current team
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if moves_left > 0 and is_valid_move(team, row, col):
                grid[row][col] = team
                teams[team] -= 1  # Deduct move
                if fill_grid_with_unique_solutions(remaining_teams if teams[team] > 0 else remaining_teams[1:], depth + 1):
                    return True
                # Undo move if unsuccessful
                grid[row][col] = ' '
                teams[team] += 1

    return False

# Set up initial grid with picks
# picked_teams = list(teams.keys())[:6]  # First 6 teams picked
picked_teams = list(teams.keys())[5:11]  # First 6 teams picked
for idx, team in enumerate(picked_teams):
    teams[team] -= 2  # Deduct initial 2 moves for picked teams
    for pos in initial_picks_positions[idx]:
        row, col = pos[0] - 1, pos[1] - 1  # Convert to 0-indexed for grid
        grid[row][col] = team

print("Starting to search for unique solutions...\n")

# Start solving from remaining teams
remaining_teams = [team for team in teams if teams[team] > 0]
fill_grid_with_unique_solutions(remaining_teams)

# Summary
if len(unique_solutions) < MAX_SOLUTIONS:
    print(f"Search timed out after {TIMEOUT_SECONDS} seconds with {len(unique_solutions)} unique solutions found.")
else:
    print(f"Successfully found {len(unique_solutions)} unique solutions.")
