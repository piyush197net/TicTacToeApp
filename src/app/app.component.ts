import { Component, OnInit } from '@angular/core';
import { GameService, GameResponse } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Tic Tac Toe - Last 3 Moves Only';

  gameId: string = '';
  board: string[][] = [['', '', ''], ['', '', ''], ['', '', '']];
  currentPlayer: string = 'X';
  winner: string | null = null;
  isGameOver: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  isSinglePlayer: boolean = true;
  isComputerThinking: boolean = false;

  player1Moves: number[] = [];
  player2Moves: number[] = [];
  winningLine: number[] = [];

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

    if (this.isSinglePlayer && this.currentPlayer !== 'X') {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.gameService.makeMove(this.gameId, row, col).subscribe({
      next: (response: GameResponse) => {
        this.updateGameState(response);
        this.loading = false;

        if (this.isSinglePlayer && !this.isGameOver && this.currentPlayer === 'O') {
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

  toggleGameMode(): void {
    this.isSinglePlayer = !this.isSinglePlayer;
    this.startNewGame();
  }

  resetGame(): void {
    if (!this.gameId) {
      this.startNewGame();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.gameService.resetGame(this.gameId).subscribe({
      next: (response: GameResponse) => {
        this.updateGameState(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error resetting game:', error);
        this.startNewGame();
      }
    });
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
}
getCellClass(row: number, col: number): string {
    const value = this.board[row][col];
    const position = row * 3 + col;
    let classes = '';

    if (value === 'X') {
      classes = 'cell-x';
      if (!this.winner && this.player1Moves.length === 3 && this.player1Moves[0] === position) {
        classes += ' blink-warning';
      }
    } else if (value === 'O') {
      classes = 'cell-o';
    }

    if (this.winner && this.winningLine.includes(position)) {
      classes += ' cell-winner';
    }

    return classes;
}

  getStatusMessage(): string {
    if (this.winner) {
      if (this.isSinglePlayer) {
        return this.winner === 'X' ? '🎉 You Win!' : '🤖 Computer Wins!';
      }
      return `Player ${this.winner} wins!`;
    } else if (this.isGameOver) {
      return 'Game Over';
    } else if (this.isComputerThinking) {
      return '🤖 Computer is thinking...';
    } else {
      if (this.isSinglePlayer) {
        return this.currentPlayer === 'X' ? '👤 Your Turn (X)' : '🤖 Computer\'s Turn (O)';
      }
      return `Player ${this.currentPlayer}'s Turn`;
    }
  }

  getGameModeText(): string {
    return this.isSinglePlayer ? '👤 vs 🤖 Computer' : '👤 vs 👤 Two Players';
  }
}