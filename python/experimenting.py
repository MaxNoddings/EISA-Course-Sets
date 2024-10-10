# Import necessary libraries
from copy import deepcopy

# Define a function to initialize the grid and the initial state of the teams
def initialize_grid_and_teams():
    # 6x6 grid, with None meaning unoccupied spaces
    grid = [[None for _ in range(6)] for _ in range(6)]
    
    # 13 teams, 10 have 3 moves and 3 have 2 moves
    teams = {
        'Team1': 3, 'Team2': 3, 'Team3': 3, 'Team4': 3, 'Team5': 3,
        'Team6': 3, 'Team7': 3, 'Team8': 3, 'Team9': 3, 'Team10': 3,
        'Team11': 2, 'Team12': 2, 'Team13': 2
    }
    
    return grid, teams

# Apply the initial 6 picks and update the grid
def apply_initial_picks(grid, picks):
    # Each pick has a team and the respective grid positions
    pick_positions = [
        (1, 2, 1, 3), (2, 2, 2, 4), (3, 2, 3, 3),
        (4, 2, 4, 4), (5, 2, 5, 3), (6, 2, 6, 4)
    ]
    
    for i, (team, moves) in enumerate(picks):
        x1, y1, x2, y2 = pick_positions[i]
        grid[x1 - 1][y1 - 1] = team
        grid[x2 - 1][y2 - 1] = team
        moves -= 2
        if moves == 0:
            del picks[i]
    return grid, picks

# Check if placing a team in the specified spot is valid
def is_valid(grid, team, row, col, team_placements):
    # Check if the column or row is already taken by the same team
    if any(grid[row][c] == team for c in range(6)):  # Same row check
        return False
    if any(grid[r][col] == team for r in range(6)):  # Same column check
        return False
    
    # Check if placing in this row violates previous row constraints
    for r in range(row):
        if grid[r][col] == team:
            return False
    
    return True

# Backtracking function to solve the grid
def backtrack(grid, teams, team_placements, solutions, row=0, col=0, max_solutions=10):
    if len(solutions) >= max_solutions:  # Stop if we have found enough solutions
        return

    if row == 6:  # If we've reached the end of the grid
        solutions.append(deepcopy(grid))  # Save a solution
        print(deepcopy(grid)) # Print out the solution grid
        return

    if grid[row][col] is not None:  # Move to the next cell if this one is already filled
        if col == 5:
            backtrack(grid, teams, team_placements, solutions, row + 1, 0)
        else:
            backtrack(grid, teams, team_placements, solutions, row, col + 1)
        return

    # Try placing any available team in the current cell
    for team in teams:
        if is_valid(grid, team, row, col, team_placements):
            grid[row][col] = team
            teams[team] -= 1
            
            # Move to the next cell
            if col == 5:
                backtrack(grid, teams, team_placements, solutions, row + 1, 0)
            else:
                backtrack(grid, teams, team_placements, solutions, row, col + 1)
            
            # Backtrack: undo the move
            grid[row][col] = None
            teams[team] += 1

# Main function to set up and find solutions
def solve_game():
    # Initialize the grid and teams
    grid, teams = initialize_grid_and_teams()
    
    # Define the initial picks (team names and remaining moves after the first 6 picks)
    picks = [
        ('Team1', 3), ('Team2', 3), ('Team3', 3), 
        ('Team4', 3), ('Team5', 3), ('Team6', 3)
    ]
    
    # Apply the initial picks
    grid, picks = apply_initial_picks(grid, picks)
    
    # Prepare to collect solutions
    solutions = []
    
    # Backtrack and fill in the remaining grid spaces
    backtrack(grid, teams, {}, solutions)
    
    # Return all found solutions
    return solutions

# Call the solve_game function and print solutions
if __name__ == '__main__':
    solutions = solve_game()
    
    # Display the first few solutions for simplicity
    for i, solution in enumerate(solutions):
        print(f"Solution {i+1}:")
        for row in solution:
            print(row)
        print("\n")