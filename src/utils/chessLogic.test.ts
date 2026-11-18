import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBoard,
  getPieceMoves,
  getAllLegalMoves,
  applyMove,
  chooseBotMove,
  evaluateBoard,
  isKingInCheck,
  evaluateGameStatus,
  ChessBoard,
} from './chessLogic';

test('createInitialBoard sets up 32 pieces on 8x8 grid', () => {
  const board = createInitialBoard();
  assert.equal(board.length, 8);
  assert.equal(board[0].length, 8);

  // Check White pieces
  assert.equal(board[7][4]?.type, 'k');
  assert.equal(board[7][4]?.color, 'w');
  assert.equal(board[6][0]?.type, 'p');

  // Check Black pieces
  assert.equal(board[0][4]?.type, 'k');
  assert.equal(board[0][4]?.color, 'b');
  assert.equal(board[1][0]?.type, 'p');

  // Initial evaluate score should be symmetric (0)
  const initialScore = evaluateBoard(board);
  assert.equal(initialScore, 0);

  // Initial game status should be active and not in check
  const status = evaluateGameStatus(board, 'w');
  assert.equal(status.status, 'active');
  assert.equal(status.inCheck, false);
});

test('pawn moves forward 1 or 2 squares on first move', () => {
  const board = createInitialBoard();
  // White pawn at (6, 4) e2
  const pawnMoves = getPieceMoves(board, { row: 6, col: 4 });
  assert.equal(pawnMoves.length, 2);
  const targets = pawnMoves.map(m => `${m.to.row},${m.to.col}`);
  assert.ok(targets.includes('5,4')); // e3
  assert.ok(targets.includes('4,4')); // e4
});

test('knight jumps over pieces in L shape', () => {
  const board = createInitialBoard();
  // White knight at (7, 1) b1
  const knightMoves = getPieceMoves(board, { row: 7, col: 1 });
  assert.equal(knightMoves.length, 2); // a3, c3
  const targets = knightMoves.map(m => `${m.to.row},${m.to.col}`);
  assert.ok(targets.includes('5,0')); // a3
  assert.ok(targets.includes('5,2')); // c3
});

test('evaluateGameStatus accurately detects check and checkmate', () => {
  // Construct a direct Scholar's mate board state (White Queen delivers mate on f7)
  const board: ChessBoard = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Kings
  board[0][4] = { type: 'k', color: 'b' }; // Black King at e8
  board[7][4] = { type: 'k', color: 'w' }; // White King at e1

  // White Bishop at c4 protecting f7
  board[4][2] = { type: 'b', color: 'w' }; // (row 4, col 2 is c4)

  // White Queen delivers check at f7 (row 1, col 5)
  board[1][5] = { type: 'q', color: 'w' };

  // Surrounding black pawns and pieces blocking escape
  board[0][3] = { type: 'q', color: 'b' }; // d8 (Queen)
  board[0][5] = { type: 'b', color: 'b' }; // f8 (Bishop)
  board[1][3] = { type: 'p', color: 'b' }; // d7
  board[1][4] = { type: 'p', color: 'b' }; // e7

  // Check condition for Black
  assert.equal(isKingInCheck(board, 'b'), true);

  const status = evaluateGameStatus(board, 'b');
  assert.equal(status.status, 'checkmate');
  assert.equal(status.inCheck, true);
  assert.equal(status.winner, 'w');
  assert.ok(status.description.includes('Jaque Mate'));
});

test('chooseBotMove returns a strictly legal move for black', () => {
  const board = createInitialBoard();
  const botMoveNovice = chooseBotMove(board, 'b', 'novice');
  assert.ok(botMoveNovice !== null);
  assert.ok(botMoveNovice.from.row === 0 || botMoveNovice.from.row === 1);

  const botMoveMedium = chooseBotMove(board, 'b', 'medium');
  assert.ok(botMoveMedium !== null);

  const botMoveMaster = chooseBotMove(board, 'b', 'master');
  assert.ok(botMoveMaster !== null);
});
