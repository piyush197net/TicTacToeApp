/**
 * Local game engine — all game logic runs on-device (no backend needed).
 * Ported from the C# GameController / Game class.
 */

export interface GameState {
  gameId: string;
  board: string[][];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  player1Moves: number[];
  player2Moves: number[];
  winningLine: number[] | null;
}

export class GameEngine {
  private board: string[][];
  private currentPlayer: string;
  private player1Moves: number[];  // queue (FIFO via shift)
  private player2Moves: number[];
  private winner: string | null;
  private isGameOver: boolean;
  private winningLine: number[] | null;
  private gameId: string;

  constructor() {
    this.gameId = this.generateId();
    this.board = this.emptyBoard();
    this.currentPlayer = 'X';
    this.player1Moves = [];
    this.player2Moves = [];
    this.winner = null;
    this.isGameOver = false;
    this.winningLine = null;
  }

  // ── public API (mirrors the old HTTP endpoints) ──────────────────────

  /** Start a brand-new game and return its state. */
  newGame(): GameState {
    this.gameId = this.generateId();
    this.resetInternal();
    return this.snapshot();
  }

  /** Return the current game state. */
  getGame(): GameState {
    return this.snapshot();
  }

  /** Human player makes a move. Returns null if invalid. */
  makeMove(row: number, col: number): GameState | null {
    if (row < 0 || row > 2 || col < 0 || col > 2) return null;
    if (this.board[row][col] !== '') return null;
    if (this.isGameOver) return null;

    this.applyMove(row, col);
    return this.snapshot();
  }

  /** Computer (O) picks its best move. Returns null if game over or not O's turn. */
  makeComputerMove(): GameState | null {
    if (this.isGameOver) return null;
    if (this.currentPlayer !== 'O') return null;

    const [row, col] = this.getComputerMove();
    if (row === -1) return null;

    this.applyMove(row, col);
    return this.snapshot();
  }

  /** Reset current game. */
  resetGame(): GameState {
    this.resetInternal();
    return this.snapshot();
  }

  // ── core game logic ──────────────────────────────────────────────────

  private applyMove(row: number, col: number): void {
    this.board[row][col] = this.currentPlayer;
    const position = row * 3 + col;

    if (this.currentPlayer === 'X') {
      this.player1Moves.push(position);
      if (this.player1Moves.length > 3) {
        const oldPos = this.player1Moves.shift()!;
        this.board[Math.floor(oldPos / 3)][oldPos % 3] = '';
      }
    } else {
      this.player2Moves.push(position);
      if (this.player2Moves.length > 3) {
        const oldPos = this.player2Moves.shift()!;
        this.board[Math.floor(oldPos / 3)][oldPos % 3] = '';
      }
    }

    if (this.checkWinner()) {
      this.winner = this.currentPlayer;
      this.isGameOver = true;
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
  }

  private checkWinner(): boolean {
    const b = this.board;

    // Rows
    for (let i = 0; i < 3; i++) {
      if (b[i][0] !== '' && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
        this.winningLine = [i * 3, i * 3 + 1, i * 3 + 2];
        return true;
      }
    }

    // Columns
    for (let i = 0; i < 3; i++) {
      if (b[0][i] !== '' && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
        this.winningLine = [i, 3 + i, 6 + i];
        return true;
      }
    }

    // Diagonals
    if (b[0][0] !== '' && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      this.winningLine = [0, 4, 8];
      return true;
    }
    if (b[0][2] !== '' && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      this.winningLine = [2, 4, 6];
      return true;
    }

    return false;
  }

  // ── computer AI ──────────────────────────────────────────────────────

  private getComputerMove(): [number, number] {
    // 1. Try to win
    const win = this.findWinningMove('O');
    if (win) return win;

    // 2. Block opponent
    const block = this.findWinningMove('X');
    if (block) return block;

    // 3. Take center
    if (this.board[1][1] === '') return [1, 1];

    // 4. Take a corner
    const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
    for (const [r, c] of corners) {
      if (this.board[r][c] === '') return [r, c];
    }

    // 5. Take any empty cell
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') return [i, j];
      }
    }

    return [-1, -1];
  }

  private findWinningMove(player: string): [number, number] | null {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          this.board[i][j] = player;
          const wins = this.checkWinner();
          this.board[i][j] = '';
          // Reset winningLine since this was just a probe
          this.winningLine = null;
          if (wins) return [i, j];
        }
      }
    }
    return null;
  }

  // ── helpers ──────────────────────────────────────────────────────────

  private resetInternal(): void {
    this.board = this.emptyBoard();
    this.currentPlayer = 'X';
    this.player1Moves = [];
    this.player2Moves = [];
    this.winner = null;
    this.isGameOver = false;
    this.winningLine = null;
  }

  private emptyBoard(): string[][] {
    return [['', '', ''], ['', '', ''], ['', '', '']];
  }

  private snapshot(): GameState {
    return {
      gameId: this.gameId,
      board: this.board.map(row => [...row]),
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      isGameOver: this.isGameOver,
      player1Moves: [...this.player1Moves],
      player2Moves: [...this.player2Moves],
      winningLine: this.winningLine ? [...this.winningLine] : null,
    };
  }

  private generateId(): string {
    return 'game-' + Math.random().toString(36).substring(2, 10);
  }
}
