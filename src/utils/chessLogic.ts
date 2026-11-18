export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface ChessMove {
  from: Position;
  to: Position;
  captured?: ChessPiece | null;
  promotion?: PieceType;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

/**
 * Creates the standard 8x8 starting chess board
 */
export function createInitialBoard(): ChessBoard {
  const board: ChessBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (rows 0 and 1)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
  }

  // White pieces (rows 6 and 7)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: backRank[c], color: 'w' };
  }

  return board;
}

export function isInsideBoard(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/**
 * Finds the king's position for a given color
 */
export function findKing(board: ChessBoard, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Generates pseudo-legal moves for a specific piece (ignoring check to king)
 */
export function getPseudoPieceMoves(board: ChessBoard, from: Position): ChessMove[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: ChessMove[] = [];
  const { color, type } = piece;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';

  if (type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;

    // Single step forward
    const nextRow = from.row + dir;
    if (isInsideBoard(nextRow, from.col) && !board[nextRow][from.col]) {
      moves.push({ from, to: { row: nextRow, col: from.col } });

      // Double step forward from start
      const doubleRow = from.row + dir * 2;
      if (from.row === startRow && !board[doubleRow][from.col]) {
        moves.push({ from, to: { row: doubleRow, col: from.col } });
      }
    }

    // Diagonal captures
    for (const dCol of [-1, 1]) {
      const capCol = from.col + dCol;
      if (isInsideBoard(nextRow, capCol)) {
        const target = board[nextRow][capCol];
        if (target && target.color === oppColor) {
          moves.push({ from, to: { row: nextRow, col: capCol }, captured: target });
        }
      }
    }
  } else if (type === 'n') {
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (isInsideBoard(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === oppColor) {
          moves.push({ from, to: { row: nr, col: nc }, captured: target });
        }
      }
    }
  } else if (type === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = from.row + dr;
        const nc = from.col + dc;
        if (isInsideBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === oppColor) {
            moves.push({ from, to: { row: nr, col: nc }, captured: target });
          }
        }
      }
    }
  } else {
    // Sliding pieces: r, b, q
    const directions: [number, number][] = [];
    if (type === 'r' || type === 'q') {
      directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (type === 'b' || type === 'q') {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dr, dc] of directions) {
      let step = 1;
      while (true) {
        const nr = from.row + dr * step;
        const nc = from.col + dc * step;
        if (!isInsideBoard(nr, nc)) break;
        const target = board[nr][nc];
        if (!target) {
          moves.push({ from, to: { row: nr, col: nc } });
        } else {
          if (target.color === oppColor) {
            moves.push({ from, to: { row: nr, col: nc }, captured: target });
          }
          break; // blocked by piece
        }
        step++;
      }
    }
  }

  return moves;
}

/**
 * Checks if a square is attacked by any piece of the attackerColor
 */
export function isSquareAttacked(board: ChessBoard, square: Position, attackerColor: PieceColor): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        const moves = getPseudoPieceMoves(board, { row: r, col: c });
        if (moves.some(m => m.to.row === square.row && m.to.col === square.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Determines if the king of the given color is currently in check
 */
export function isKingInCheck(board: ChessBoard, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingPos, oppColor);
}

/**
 * Clones board and applies move
 */
export function applyMove(board: ChessBoard, move: ChessMove): ChessBoard {
  const newBoard: ChessBoard = board.map(row => [...row]);
  const piece = newBoard[move.from.row][move.from.col];

  if (!piece) return newBoard;

  newBoard[move.from.row][move.from.col] = null;

  // Pawn promotion to Queen
  if (piece.type === 'p' && (move.to.row === 0 || move.to.row === 7)) {
    newBoard[move.to.row][move.to.col] = { type: 'q', color: piece.color };
  } else {
    newBoard[move.to.row][move.to.col] = piece;
  }

  return newBoard;
}

/**
 * Generates STRICTLY LEGAL moves for a piece (filtering out moves that leave own king in check)
 */
export function getLegalPieceMoves(board: ChessBoard, from: Position): ChessMove[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const pseudoMoves = getPseudoPieceMoves(board, from);
  return pseudoMoves.filter(move => {
    const nextBoard = applyMove(board, move);
    return !isKingInCheck(nextBoard, piece.color);
  });
}

/**
 * Gets all legal moves for a given color
 */
export function getAllLegalMoves(board: ChessBoard, color: PieceColor): ChessMove[] {
  const moves: ChessMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        moves.push(...getLegalPieceMoves(board, { row: r, col: c }));
      }
    }
  }
  return moves;
}

/**
 * Backward compatibility alias for previous calls
 */
export const getPieceMoves = getLegalPieceMoves;
export const getAllMoves = getAllLegalMoves;

export type GameStateResult = 'active' | 'check' | 'checkmate' | 'stalemate';

/**
 * Evaluates current game condition for the side whose turn it is
 */
export function evaluateGameStatus(board: ChessBoard, turn: PieceColor): {
  status: GameStateResult;
  inCheck: boolean;
  winner?: PieceColor;
  description: string;
} {
  const inCheck = isKingInCheck(board, turn);
  const legalMoves = getAllLegalMoves(board, turn);

  if (legalMoves.length === 0) {
    if (inCheck) {
      const winner: PieceColor = turn === 'w' ? 'b' : 'w';
      return {
        status: 'checkmate',
        inCheck: true,
        winner,
        description: `¡Jaque Mate! Victoria de las ${winner === 'w' ? 'Blancas' : 'Negras'}.`,
      };
    } else {
      return {
        status: 'stalemate',
        inCheck: false,
        description: '¡Tablas por Rey Ahogado! La partida es un empate justo.',
      };
    }
  }

  if (inCheck) {
    return {
      status: 'check',
      inCheck: true,
      description: `¡Jaque al Rey de las ${turn === 'w' ? 'Blancas' : 'Negras'}!`,
    };
  }

  return {
    status: 'active',
    inCheck: false,
    description: `Turno de las ${turn === 'w' ? 'Blancas' : 'Negras'}.`,
  };
}

/**
 * Evaluates board position from White's perspective
 */
export function evaluateBoard(board: ChessBoard): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type];
      const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
      const positionBonus = (7 - centerDist) * 5;

      const totalVal = val + positionBonus;
      score += piece.color === 'w' ? totalVal : -totalVal;
    }
  }
  return score;
}

/**
 * Chooses AI bot move based on difficulty using strictly legal moves
 */
export function chooseBotMove(
  board: ChessBoard,
  botColor: PieceColor = 'b',
  difficulty: 'novice' | 'medium' | 'master' = 'medium'
): ChessMove | null {
  const moves = getAllLegalMoves(board, botColor);
  if (moves.length === 0) return null;

  if (difficulty === 'novice') {
    const captureMoves = moves.filter(m => m.captured);
    if (captureMoves.length > 0 && Math.random() < 0.4) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    let bestScore = botColor === 'b' ? Infinity : -Infinity;
    let bestMoves: ChessMove[] = [];

    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const score = evaluateBoard(nextBoard);

      if (botColor === 'b') {
        if (score < bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      } else {
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
  }

  // Master: 2-ply minimax
  let bestMove: ChessMove = moves[0];
  let bestScore = botColor === 'b' ? Infinity : -Infinity;

  for (const move of moves) {
    const b1 = applyMove(board, move);
    const oppMoves = getAllLegalMoves(b1, botColor === 'b' ? 'w' : 'b');

    let worstOppResponse = botColor === 'b' ? -Infinity : Infinity;

    if (oppMoves.length === 0) {
      // Opponent is checkmated or stalemated
      const status = evaluateGameStatus(b1, botColor === 'b' ? 'w' : 'b');
      if (status.status === 'checkmate') {
        return move; // Instant checkmate move!
      }
      worstOppResponse = evaluateBoard(b1);
    } else {
      for (const oppMove of oppMoves) {
        const b2 = applyMove(b1, oppMove);
        const eval2 = evaluateBoard(b2);
        if (botColor === 'b') {
          if (eval2 > worstOppResponse) worstOppResponse = eval2;
        } else {
          if (eval2 < worstOppResponse) worstOppResponse = eval2;
        }
      }
    }

    if (botColor === 'b') {
      if (worstOppResponse < bestScore) {
        bestScore = worstOppResponse;
        bestMove = move;
      }
    } else {
      if (worstOppResponse > bestScore) {
        bestScore = worstOppResponse;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
