import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { GameEngine, GameState } from './game-engine';

export interface GameResponse {
  gameId: string;
  board: string[][];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  player1Moves: number[];
  player2Moves: number[];
  winningLine: number[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private engine = new GameEngine();

  newGame(): Observable<GameResponse> {
    return of(this.toResponse(this.engine.newGame()));
  }

  getGame(_gameId: string): Observable<GameResponse> {
    return of(this.toResponse(this.engine.getGame()));
  }

  makeMove(_gameId: string, row: number, col: number): Observable<GameResponse> {
    const state = this.engine.makeMove(row, col);
    if (!state) return throwError(() => new Error('Invalid move'));
    return of(this.toResponse(state));
  }

  makeComputerMove(_gameId: string): Observable<GameResponse> {
    const state = this.engine.makeComputerMove();
    if (!state) return throwError(() => new Error('Cannot make computer move'));
    return of(this.toResponse(state));
  }

  resetGame(_gameId: string): Observable<GameResponse> {
    return of(this.toResponse(this.engine.resetGame()));
  }

  private toResponse(state: GameState): GameResponse {
    return { ...state };
  }
}
