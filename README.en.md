# Démineur (Minesweeper)

Classic minesweeper: open every cell that does not hide a mine, using the numbers. Three levels and a custom board, a "no guessing" mode where everything is solved by logic, hints, and records per level.

*Version française : [README.md](README.md)*

## Controls

- **Click**: open a cell. The **first click is never a mine**.
- **Right-click**: place a flag, then a "?", then nothing.
- **Click a number** whose flags are all placed (or **middle-click**, or **both buttons** at once): opens all its neighbours at once.
- **Click the face**: new game.

## The rules

- Each number tells how many mines are among the 8 cells around it. A cell with no mine around opens wide, along with all its neighbours.
- You win when every mine-free cell is open; opening a mine loses the game ("Boom!").
- The counter at the top shows the mines left (mines minus flags placed) and the timer your time.

## Levels

- **Beginner**: 9 × 9, 10 mines.
- **Intermediate**: 16 × 16, 40 mines.
- **Expert**: 30 × 16, 99 mines.
- **Custom**: choose width, height and number of mines (5 to 40 columns, 5 to 30 rows), for example `24 x 18 x 70`.

## The aids

- **No guessing**: the board is generated so that it can always be solved by logic, without ever having to guess between two cells.
- **Hint**: opens a safe cell, at the cost of a 10-second penalty; a game with a hint does not count for the record.
- **Board size**: enlarges or shrinks the display of the cells.

## Statistics

The header shows your best time at each level, and for the current level your games won out of played and your winning streak.

## Data and sync

Your best times and statistics are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Démineur → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
