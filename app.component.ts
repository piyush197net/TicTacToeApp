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
    if (this.isGameOver || this.loading || this.board[row][col] !== '') {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.gameService.makeMove(this.gameId, row, col).subscribe({
      next: (response: GameResponse) => {
        this.updateGameState(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error making move:', error);
        this.errorMessage = 'Invalid move. Please try again.';
        this.loading = false;
      }
    });
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
  }

  getCellClass(row: number, col: number): string {
    const value = this.board[row][col];
    if (value === 'X') {
      return 'cell-x';
    } else if (value === 'O') {
      return 'cell-o';
    }
    return '';
  }

  getStatusMessage(): string {
    if (this.winner) {
      return `Player ${this.winner} wins!`;
    } else if (this.isGameOver) {
      return 'Game Over';
    } else {
      return `Player ${this.currentPlayer}'s Turn`;
    }
  }
}
