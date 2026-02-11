import { Component, OnInit } from '@angular/core';
import { GameService, GameResponse } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  gameId: string = '';
  board: string[][] = [['', '', ''], ['', '', ''], ['', '', '']];
  currentPlayer: string = 'X';
  winner: string | null = null;
  isGameOver: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  isComputerThinking: boolean = false;
  showResult: boolean = false;

  player1Moves: number[] = [];
  player2Moves: number[] = [];
  winningLine: number[] = [];

  scores = { X: 0, O: 0, draws: 0 };

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.startNewGame();
  }

  startNewGame(): void {
    this.loading = true;
    this.errorMessage = '';

    this.gameService.newGame().subscribe({
      next: (response: GameResponse) => {
        this.updateGameState(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error starting new game:', error);
        this.errorMessage = 'Failed to start new game. Please try again.';
        this.loading = false;
      }
    });
  }

  onCellClick(row: number, col: number): void {
    if (this.isGameOver || this.loading || this.board[row][col] !== '' || this.isComputerThinking) {
      return;
    }

    if (this.currentPlayer !== 'X') {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.gameService.makeMove(this.gameId, row, col).subscribe({
      next: (response: GameResponse) => {
        this.updateGameState(response);
        this.loading = false;

        if (!this.isGameOver && this.currentPlayer === 'O') {
          this.makeComputerMove();
        }
      },
      error: (error) => {
        console.error('Error making move:', error);
        this.errorMessage = 'Invalid move. Please try again.';
        this.loading = false;
      }
    });
  }

  makeComputerMove(): void {
    this.isComputerThinking = true;

    setTimeout(() => {
      this.gameService.makeComputerMove(this.gameId).subscribe({
        next: (response: GameResponse) => {
          this.updateGameState(response);
          this.isComputerThinking = false;
        },
        error: (error) => {
          console.error('Error making computer move:', error);
          this.isComputerThinking = false;
        }
      });
    }, 500);
  }

  restartGame(): void {
    this.showResult = false;
    this.startNewGame();
  }

  private updateGameState(response: GameResponse): void {
    this.gameId = response.gameId;
    this.board = response.board;
    this.currentPlayer = response.currentPlayer;
    this.winner = response.winner;
    this.isGameOver = response.isGameOver;
    this.player1Moves = response.player1Moves || [];
    this.player2Moves = response.player2Moves || [];
    this.winningLine = response.winningLine || [];

    if (this.isGameOver && this.winner) {
      this.scores[this.winner as 'X' | 'O']++;
      setTimeout(() => { this.showResult = true; }, 400);
    }
  }

  // ── Template helpers ──

  getTurnLabel(): string {
    if (this.isGameOver) return 'GAME OVER';
    if (this.isComputerThinking) return 'AI THINKING...';
    return this.currentPlayer === 'X' ? 'YOUR TURN' : 'AI TURN';
  }

  isWinCell(row: number, col: number): boolean {
    return this.winningLine.includes(row * 3 + col);
  }

  getPieceClasses(row: number, col: number): { [key: string]: boolean } {
    const value = this.board[row][col];
    const position = row * 3 + col;
    const isX = value === 'X';
    const moves = isX ? this.player1Moves : this.player2Moves;
    const posInQueue = moves.indexOf(position);
    const age = posInQueue >= 0 ? moves.length - 1 - posInQueue : 0;

    return {
      'x-piece': isX,
      'o-piece': !isX,
      'age-0': age === 0,
      'age-1': age === 1,
      'age-2': age === 2,
    };
  }

  getMoveBadge(row: number, col: number): string {
    const value = this.board[row][col];
    const position = row * 3 + col;
    const moves = value === 'X' ? this.player1Moves : this.player2Moves;
    const posInQueue = moves.indexOf(position);
    const age = posInQueue >= 0 ? moves.length - 1 - posInQueue : 0;
    return age === 0 ? 'new' : age === 1 ? '2nd' : 'old';
  }

  getWinnerColor(): string {
    if (!this.winner) return 'var(--muted)';
    return this.winner === 'X' ? 'var(--x-color)' : 'var(--o-color)';
  }

  getResultTitle(): string {
    if (!this.winner) return 'DRAW';
    return this.winner === 'X' ? 'YOU WIN!' : 'AI WINS!';
  }

  getResultLabel(): string {
    if (!this.winner) return 'No one wins this round';
    return this.winner === 'X' ? 'Great job! You beat the AI' : 'The AI takes this round';
  }

  getWinLineStyle(): { [key: string]: string } {
    if (this.winningLine.length !== 3) return {};

    const sorted = [...this.winningLine].sort((a, b) => a - b);
    const [a, , c] = sorted;

    // Convert cell index to grid center coordinates (percentages)
    const cx = (pos: number) => ((pos % 3) * 33.33 + 16.67) + '%';
    const cy = (pos: number) => (Math.floor(pos / 3) * 33.33 + 16.67) + '%';

    const x1 = (sorted[0] % 3) * 33.33 + 16.67;
    const y1 = Math.floor(sorted[0] / 3) * 33.33 + 16.67;
    const x2 = (sorted[2] % 3) * 33.33 + 16.67;
    const y2 = Math.floor(sorted[2] / 3) * 33.33 + 16.67;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const color = this.winner === 'X' ? '#ff4d6d' : '#4dffb8';

    return {
      'left': x1 + '%',
      'top': y1 + '%',
      'width': length + '%',
      'transform': `rotate(${angle}deg)`,
      'background': `linear-gradient(90deg, transparent, ${color}, transparent)`,
    };
  }
}