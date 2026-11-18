import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';
import { UserProfile } from '../types';
import { playChime } from '../utils/audioSpeech';
import { GoogleAdSenseBanner } from './GoogleAdSenseBanner';
import confetti from 'canvas-confetti';
import {
  Users,
  Bot,
  RotateCcw,
  Trophy,
  Swords,
  Timer,
  Lock,
  Sparkles,
  AlertTriangle,
  Flag,
  CheckCircle2,
  Crown,
  Eye,
  RefreshCw,
  Award,
} from 'lucide-react';

interface ChessGameProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenFreemium: () => void;
}

export const ChessGame: React.FC<ChessGameProps> = ({
  user,
  onUpdateUser,
  onOpenFreemium,
}) => {
  // chess.js instance managed in ref to maintain pure FIDE rule engine
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'w' | 'b'>('w');
  const [gameMode, setGameMode] = useState<'bot' | 'pvp'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<'novice' | 'medium' | 'master'>('medium');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [whiteTimer, setWhiteTimer] = useState<number>(300);
  const [blackTimer, setBlackTimer] = useState<number>(300);

  // Victory & Game State
  const [gameStatus, setGameStatus] = useState<'active' | 'white_won' | 'black_won' | 'draw'>('active');
  const [statusMessage, setStatusMessage] = useState<string>('Partida en curso con motor chess.js. Turno de las Blancas.');
  const [victoryDetails, setVictoryDetails] = useState<{
    title: string;
    subtitle: string;
    reason: string;
    winner: 'w' | 'b' | 'draw';
    eloGained: number;
    xpGained: number;
    chakanasGained: number;
  } | null>(null);

  // Visual highlights
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [checkedKingSquare, setCheckedKingSquare] = useState<Square | null>(null);
  const [isVictoryModalDismissed, setIsVictoryModalDismissed] = useState<boolean>(false);

  // Matchmaking simulation state for PvP
  const [isSearchingPvP, setIsSearchingPvP] = useState<boolean>(false);
  const [pvpOpponent, setPvpOpponent] = useState<{ name: string; elo: number; city: string } | null>(null);

  // Helper to find the king's square for a given color using chess.js
  const findKingSquare = (chess: Chess, color: 'w' | 'b'): Square | null => {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return piece.square;
        }
      }
    }
    return null;
  };

  // Triggers victory celebration and user progression
  const triggerWhiteVictory = (reason: string) => {
    setGameStatus('white_won');
    const details = {
      title: '¡VICTORIA POR JAQUE MATE!',
      subtitle: '¡Has dominado el tablero con maestría estratégica!',
      reason: `${reason} - El Rey negro no tiene ningún movimiento legal de escape.`,
      winner: 'w' as const,
      eloGained: 25,
      xpGained: 50,
      chakanasGained: 10,
    };
    setVictoryDetails(details);
    setStatusMessage('¡Jaque Mate! Victoria contundente de las Blancas. +25 ELO');
    setIsVictoryModalDismissed(false);
    playChime('success');

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#0ea5e9', '#6366f1', '#ffffff'],
      });
    } catch {
      // ignore
    }

    onUpdateUser({
      chessStats: {
        ...user.chessStats,
        wins: user.chessStats.wins + 1,
        elo: user.chessStats.elo + 25,
      },
      xp: user.xp + 50,
      chakanas: user.chakanas + 10,
    });
  };

  // Evaluates game status using chess.js methods
  const evaluateChessJsState = (game: Chess, justPlayedColor: 'w' | 'b'): boolean => {
    // 1. Strict Checkmate detection by chess.js
    if (game.isCheckmate()) {
      const matedSide = game.turn(); // The side whose turn it is now is in checkmate
      const matedKing = findKingSquare(game, matedSide);
      setCheckedKingSquare(matedKing);

      if (justPlayedColor === 'w') {
        triggerWhiteVictory('Jaque Mate FIDE');
      } else {
        setGameStatus('black_won');
        setVictoryDetails({
          title: '¡JAQUE MATE - DERROTA!',
          subtitle: 'El Bot IA ha acorralado a tu Rey',
          reason: 'El Rey blanco está bajo ataque directo y no existen movimientos legales de defensa.',
          winner: 'b',
          eloGained: -10,
          xpGained: 15,
          chakanasGained: 2,
        });
        setStatusMessage('¡Jaque Mate! Victoria para las Negras.');
        setIsVictoryModalDismissed(false);
        playChime('error');
        onUpdateUser({
          chessStats: {
            ...user.chessStats,
            losses: user.chessStats.losses + 1,
            elo: Math.max(1000, user.chessStats.elo - 10),
          },
        });
      }
      return true;
    }

    // 2. Stalemate (Rey Ahogado)
    if (game.isStalemate()) {
      setGameStatus('draw');
      setVictoryDetails({
        title: '¡TABLAS POR REY AHOGADO!',
        subtitle: 'Empate Técnico (Stalemate)',
        reason: 'El jugador en turno no está en jaque pero carece de movimientos legales.',
        winner: 'draw',
        eloGained: 5,
        xpGained: 25,
        chakanasGained: 5,
      });
      setStatusMessage('¡Tablas por Rey Ahogado! Partida empatada.');
      setCheckedKingSquare(null);
      setIsVictoryModalDismissed(false);
      playChime('bell');
      onUpdateUser({
        chessStats: {
          ...user.chessStats,
          draws: user.chessStats.draws + 1,
          elo: user.chessStats.elo + 5,
        },
      });
      return true;
    }

    // 3. Draw by repetition or insufficient material
    if (game.isDraw()) {
      const reasonText = game.isThreefoldRepetition()
        ? 'Tablas por triple repetición de posición'
        : game.isInsufficientMaterial()
        ? 'Tablas por material insuficiente'
        : 'Tablas reglamentarias de ajedrez';

      setGameStatus('draw');
      setVictoryDetails({
        title: '¡TABLAS REGLAMENTARIAS!',
        subtitle: 'Empate Declarado',
        reason: reasonText,
        winner: 'draw',
        eloGained: 5,
        xpGained: 25,
        chakanasGained: 5,
      });
      setStatusMessage(`Empate técnico: ${reasonText}.`);
      setCheckedKingSquare(null);
      setIsVictoryModalDismissed(false);
      playChime('bell');
      return true;
    }

    // 4. In Check alert
    if (game.inCheck()) {
      const kingSq = findKingSquare(game, game.turn());
      setCheckedKingSquare(kingSq);
      setStatusMessage(`¡JAQUE al Rey ${game.turn() === 'w' ? 'Blanco' : 'Negro'}! La amenaza debe neutralizarse.`);
      playChime('bell');
    } else {
      setCheckedKingSquare(null);
      setStatusMessage(`Turno de las ${game.turn() === 'w' ? 'Blancas (Tú)' : 'Negras'}.`);
    }

    return false;
  };

  // Bot move generation backed by chess.js
  const chooseSmartBotMove = (game: Chess, difficulty: 'novice' | 'medium' | 'master'): Move | null => {
    const legalMoves = game.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    // A. Priority 1: Check if any move immediately checkmates White!
    for (const move of legalMoves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      if (clone.isCheckmate()) {
        return move; // Deliver immediate mate!
      }
    }

    // B. Novice: picks mostly random moves, occasionally captures
    if (difficulty === 'novice') {
      const captures = legalMoves.filter(m => m.captured);
      if (captures.length > 0 && Math.random() < 0.35) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Piece values
    const pieceValues: Record<string, number> = {
      p: 100,
      n: 320,
      b: 330,
      r: 500,
      q: 900,
      k: 20000,
    };
    const centerSquares = ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'];

    // C. Medium: Tactical evaluation
    if (difficulty === 'medium') {
      let bestMove = legalMoves[0];
      let bestScore = -Infinity;

      for (const m of legalMoves) {
        let score = 0;
        if (m.captured) {
          score += (pieceValues[m.captured] || 100) * 10 - (pieceValues[m.piece] || 100);
        }
        if (centerSquares.includes(m.to)) score += 20;

        const clone = new Chess(game.fen());
        clone.move(m);
        if (clone.inCheck()) score += 30;

        // Penalty if moved piece is hanging
        const oppResponses = clone.moves({ verbose: true });
        if (oppResponses.some(r => r.to === m.to && (pieceValues[m.piece] || 100) > (pieceValues[r.piece] || 100))) {
          score -= (pieceValues[m.piece] || 100) * 4;
        }

        score += Math.random() * 8; // Slight variation
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
      return bestMove;
    }

    // D. Master: 2-ply Minimax evaluation
    let bestMove = legalMoves[0];
    let bestEval = Infinity; // Black minimizes score

    for (const m of legalMoves) {
      const clone1 = new Chess(game.fen());
      clone1.move(m);

      if (clone1.isCheckmate()) return m;

      const oppMoves = clone1.moves({ verbose: true });
      let worstWhiteCounter = -Infinity;

      if (oppMoves.length === 0) {
        worstWhiteCounter = 0;
      } else {
        for (const oppM of oppMoves) {
          const clone2 = new Chess(clone1.fen());
          clone2.move(oppM);

          // Calculate board score: White (+) vs Black (-)
          let materialScore = 0;
          const b = clone2.board();
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = b[r][c];
              if (p) {
                const val = pieceValues[p.type] || 100;
                materialScore += p.color === 'w' ? val : -val;
              }
            }
          }
          if (materialScore > worstWhiteCounter) {
            worstWhiteCounter = materialScore;
          }
        }
      }

      if (worstWhiteCounter < bestEval) {
        bestEval = worstWhiteCounter;
        bestMove = m;
      }
    }

    return bestMove;
  };

  // Bot response effect
  useEffect(() => {
    if (gameMode === 'bot' && currentTurn === 'b' && gameStatus === 'active') {
      const timer = setTimeout(() => {
        const game = chessRef.current;
        const botMove = chooseSmartBotMove(game, botDifficulty);

        if (botMove) {
          try {
            const executedMove = game.move(botMove);
            setFen(game.fen());
            setLastMove({ from: executedMove.from as Square, to: executedMove.to as Square });

            const notation = `...${executedMove.san}`;
            setMoveHistory(prev => [...prev, notation]);

            const isGameOver = evaluateChessJsState(game, 'b');
            if (!isGameOver) {
              setCurrentTurn('w');
              playChime(executedMove.captured ? 'success' : 'click');
            }
          } catch (e) {
            console.error('Error executing bot move:', e);
          }
        } else {
          // No legal moves
          evaluateChessJsState(game, 'b');
        }
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, gameStatus, botDifficulty, fen]);

  // Timers countdown
  useEffect(() => {
    if (gameStatus !== 'active') return;
    const interval = setInterval(() => {
      if (currentTurn === 'w') {
        setWhiteTimer(t => {
          if (t <= 1) {
            setGameStatus('black_won');
            setStatusMessage('¡Tiempo agotado para las Blancas! Victoria para las Negras.');
            setVictoryDetails({
              title: '¡TIEMPO AGOTADO!',
              subtitle: 'Victoria para las Negras',
              reason: 'El reloj de las Blancas ha llegado a cero.',
              winner: 'b',
              eloGained: -10,
              xpGained: 10,
              chakanasGained: 1,
            });
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTimer(t => {
          if (t <= 1) {
            triggerWhiteVictory('¡Tiempo agotado para las Negras!');
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, gameStatus]);

  // Handle Square Selection and Moves
  const handleSquareClick = (square: Square) => {
    if (gameStatus !== 'active') return;
    if (gameMode === 'bot' && currentTurn !== 'w') return;

    const game = chessRef.current;
    const piece = game.get(square);

    // If already selected a piece, attempt to move to clicked square
    if (selectedSquare) {
      const legalMovesForSquare = game.moves({ square: selectedSquare, verbose: true });
      const matchingMove = legalMovesForSquare.find(m => m.to === square);

      if (matchingMove) {
        try {
          const executed = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q', // Default auto-queen promotion for responsive play
          });

          setFen(game.fen());
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setValidMoves([]);

          const moveText = `${executed.san}`;
          setMoveHistory(prev => [...prev, moveText]);

          const isGameOver = evaluateChessJsState(game, 'w');
          if (!isGameOver) {
            setCurrentTurn('b');
            playChime(executed.captured ? 'success' : 'click');
          }
          return;
        } catch (err) {
          console.error('Move error:', err);
        }
      }
    }

    // Select new piece belonging to current player
    if (piece && piece.color === currentTurn) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves);
      playChime('click');
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleResetGame = () => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentTurn('w');
    setWhiteTimer(300);
    setBlackTimer(300);
    setGameStatus('active');
    setVictoryDetails(null);
    setIsVictoryModalDismissed(false);
    setCheckedKingSquare(null);
    setLastMove(null);
    setMoveHistory([]);
    setStatusMessage('Nueva partida iniciada con chess.js. Turno de las Blancas.');
    playChime('click');
  };

  const handleResign = () => {
    if (gameStatus !== 'active') return;
    setGameStatus('black_won');
    setVictoryDetails({
      title: 'PARTIDA FINALIZADA POR RENDICIÓN',
      subtitle: 'Victoria para las Negras',
      reason: 'El jugador con Blancas ha abandonado la partida.',
      winner: 'b',
      eloGained: -10,
      xpGained: 10,
      chakanasGained: 1,
    });
    setStatusMessage('Te has rendido. Victoria para las Negras.');
    setIsVictoryModalDismissed(false);
    playChime('error');
    onUpdateUser({
      chessStats: {
        ...user.chessStats,
        losses: user.chessStats.losses + 1,
        elo: Math.max(1000, user.chessStats.elo - 10),
      },
    });
  };

  const handleStartPvP = () => {
    if (!user.isPro) {
      onOpenFreemium();
      return;
    }

    setGameMode('pvp');
    setIsSearchingPvP(true);
    setPvpOpponent(null);
    playChime('bell');

    setTimeout(() => {
      const simulatedOpponents = [
        { name: 'Mateo_UIO', elo: 1310, city: 'Quito' },
        { name: 'Sumaq_Gye', elo: 1285, city: 'Guayaquil' },
        { name: 'AndesMaster', elo: 1340, city: 'Cuenca' },
        { name: 'Cañari_Chess', elo: 1260, city: 'Azogues' },
      ];
      const randomOpp = simulatedOpponents[Math.floor(Math.random() * simulatedOpponents.length)];
      setPvpOpponent(randomOpp);
      setIsSearchingPvP(false);
      handleResetGame();
      playChime('success');
    }, 1600);
  };

  const renderPieceSymbol = (type: PieceSymbol, color: Color) => {
    const symbols: Record<string, string> = {
      'w-k': '♔',
      'w-q': '♕',
      'w-r': '♖',
      'w-b': '♗',
      'w-n': '♘',
      'w-p': '♙',
      'b-k': '♚',
      'b-q': '♛',
      'b-r': '♜',
      'b-b': '♝',
      'b-n': '♞',
      'b-p': '♟',
    };
    return symbols[`${color}-${type}`] || '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current board from chess.js
  const boardMatrix = chessRef.current.board();

  return (
    <div className="space-y-4">
      {/* Game Mode Header */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            Módulo de Agilidad Mental & Estrategia FIDE
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <span>Ajedrez con Motor Oficial chess.js</span>
            <span className="text-xs font-medium text-sky-300">
              (ELO: <strong className="text-amber-300 font-mono">{user.chessStats.elo}</strong>)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setGameMode('bot');
              setPvpOpponent(null);
              setIsSearchingPvP(false);
              handleResetGame();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              gameMode === 'bot'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Modo Solo (vs IA)</span>
          </button>

          <button
            onClick={handleStartPvP}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              gameMode === 'pvp'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {user.isPro ? <Swords className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            <span>PvP Online</span>
            {!user.isPro && (
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 rounded">PRO</span>
            )}
          </button>
        </div>
      </div>

      {/* CLARO INDICADOR VISUAL DE VICTORIA (BANNER SUPERIOR PERMANENTE) */}
      {gameStatus !== 'active' && victoryDetails && (
        <div
          className={`p-4 rounded-2xl border-2 shadow-xl animate-in zoom-in-95 duration-300 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            victoryDetails.winner === 'w'
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 border-amber-300 text-slate-950'
              : victoryDetails.winner === 'b'
              ? 'bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-red-500 text-white'
              : 'bg-gradient-to-r from-sky-900 via-indigo-900 to-sky-900 border-sky-400 text-white'
          }`}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                victoryDetails.winner === 'w'
                  ? 'bg-slate-950 text-amber-400 ring-2 ring-slate-900'
                  : victoryDetails.winner === 'b'
                  ? 'bg-red-900 text-red-200 ring-2 ring-red-500'
                  : 'bg-sky-950 text-sky-300 ring-2 ring-sky-400'
              }`}
            >
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight">{victoryDetails.title}</span>
                {victoryDetails.winner === 'w' && (
                  <span className="bg-stone-950 text-amber-300 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    +25 ELO
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 font-medium ${victoryDetails.winner === 'w' ? 'text-stone-900' : 'text-stone-300'}`}>
                {victoryDetails.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetGame}
              className={`px-4 py-2 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 ${
                victoryDetails.winner === 'w'
                  ? 'bg-stone-950 hover:bg-stone-900 text-amber-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Jugar Otra Partida</span>
            </button>
          </div>
        </div>
      )}

      {/* Check / Checkmate Active Alert Banner */}
      {checkedKingSquare && gameStatus === 'active' && (
        <div className="p-3 bg-red-950/80 border-2 border-red-500 rounded-xl text-xs text-red-200 flex items-center justify-between gap-2 animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <strong className="text-white font-extrabold">{statusMessage}</strong>
          </div>
          <span className="text-[10px] font-mono text-red-300 bg-red-900/60 px-2 py-0.5 rounded">
            El Rey debe defenderse
          </span>
        </div>
      )}

      {/* Main Chess Arena Layout - Tablet & Phone Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Board and Player Bar (8 cols on tablet/desktop) */}
        <div className="md:col-span-7 lg:col-span-8 bg-slate-900/85 border border-slate-700/80 rounded-2xl p-3 sm:p-5 shadow-lg flex flex-col items-center relative">
          {/* Black Player Bar (Top) */}
          <div className="w-full max-w-[460px] flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-sm text-slate-200 shadow-xs">
                {gameMode === 'bot' ? '🤖' : '👤'}
              </div>
              <div>
                <div className="font-bold text-xs text-white">
                  {gameMode === 'bot' ? `Bot IA (${botDifficulty.toUpperCase()})` : pvpOpponent?.name || 'Oponente PvP'}
                </div>
                <div className="text-[10px] text-slate-400">Negras</div>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                currentTurn === 'b'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(blackTimer)}</span>
            </div>
          </div>

          {/* The 8x8 Chess Board Powered by chess.js */}
          <div className="w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden border-4 border-slate-700/90 shadow-2xl grid grid-cols-8 grid-rows-8 bg-slate-950 relative">
            {boardMatrix.map((row, rIdx) =>
              row.map((pieceObj, cIdx) => {
                const squareName = `${String.fromCharCode(97 + cIdx)}${8 - rIdx}` as Square;
                const isLightSquare = (rIdx + cIdx) % 2 === 0;
                const isSelected = selectedSquare === squareName;
                const isValidMoveTarget = validMoves.some(m => m.to === squareName);
                const isCheckedKing = checkedKingSquare === squareName;
                const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                const isCheckmatedKing = isCheckedKing && gameStatus !== 'active';

                return (
                  <button
                    key={`sq-${squareName}`}
                    data-square={squareName}
                    aria-label={`Casilla ${squareName}${
                      pieceObj
                        ? ` con ${pieceObj.color === 'w' ? 'blanca' : 'negra'} ${pieceObj.type}`
                        : ''
                    }`}
                    onClick={() => handleSquareClick(squareName)}
                    className={`relative flex items-center justify-center transition-colors focus:outline-none select-none text-2xl sm:text-4xl ${
                      isCheckmatedKing
                        ? 'bg-red-600 ring-4 ring-amber-400 text-white font-black animate-pulse z-10'
                        : isCheckedKing
                        ? 'bg-red-600/90 ring-4 ring-red-400 text-white font-black animate-pulse z-10'
                        : isSelected
                        ? 'bg-amber-400/90 text-slate-950 font-black z-10'
                        : isValidMoveTarget
                        ? isLightSquare
                          ? 'bg-sky-300/95 ring-2 ring-inset ring-sky-500'
                          : 'bg-sky-600/95 ring-2 ring-inset ring-sky-400'
                        : isLastMoveSquare
                        ? isLightSquare
                          ? 'bg-amber-200/90'
                          : 'bg-indigo-700/80'
                        : isLightSquare
                        ? 'bg-[#f0d9b5] hover:bg-[#ebd0a7]'
                        : 'bg-[#b58863] hover:bg-[#a67c58]'
                    }`}
                  >
                    {/* Legal move indicator dot */}
                    {isValidMoveTarget && !pieceObj && (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-950/75 ring-2 ring-sky-300" />
                    )}

                    {/* Legal move capture ring */}
                    {isValidMoveTarget && pieceObj && (
                      <div className="absolute inset-1 rounded-full border-2 border-red-500 bg-red-500/25 animate-pulse" />
                    )}

                    {/* Checkmate Floating Tag on King */}
                    {isCheckmatedKing && (
                      <div className="absolute -top-1 px-1 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full shadow-md z-20">
                        👑 MATE
                      </div>
                    )}

                    {/* Piece Glyph */}
                    {pieceObj && (
                      <span
                        className={`leading-none drop-shadow-sm transition-transform active:scale-95 ${
                          pieceObj.color === 'w'
                            ? 'text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]'
                            : 'text-stone-950 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]'
                        }`}
                      >
                        {renderPieceSymbol(pieceObj.type, pieceObj.color)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* White Player Bar (Bottom) */}
          <div className="w-full max-w-[460px] flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-600 border border-sky-400 flex items-center justify-center text-sm font-bold text-white shadow-xs">
                {user.displayName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-white">{user.displayName} (Tú)</div>
                <div className="text-[10px] text-slate-400">Blancas</div>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                currentTurn === 'w'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(whiteTimer)}</span>
            </div>
          </div>
        </div>

        {/* Controls, Difficulty & Game History Panel (5 cols on tablet/desktop) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-3">
          {/* Status Box */}
          <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Estado de la Partida</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResign}
                  disabled={gameStatus !== 'active'}
                  className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-40 flex items-center gap-1 font-semibold"
                  title="Rendirse"
                >
                  <Flag className="w-3 h-3" /> Rendirse
                </button>
                <button
                  onClick={handleResetGame}
                  className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
              <div className="font-semibold text-white">{statusMessage}</div>
              {gameStatus === 'white_won' && (
                <div className="text-amber-300 font-extrabold flex items-center gap-2 mt-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>¡Victoria de las Blancas! Has ganado +25 ELO</span>
                </div>
              )}
            </div>

            {/* AI Difficulty Selector */}
            {gameMode === 'bot' && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-300 font-semibold block">Dificultad de la IA:</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['novice', 'medium', 'master'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => {
                        setBotDifficulty(diff);
                        playChime('click');
                      }}
                      className={`py-1.5 rounded-lg font-bold text-[11px] border transition ${
                        botDifficulty === diff
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {diff === 'novice' ? 'Novato' : diff === 'medium' ? 'Medio' : 'Maestro'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Move History Log */}
          <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
              Registro Notación FIDE ({moveHistory.length})
            </span>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
              {moveHistory.length === 0 ? (
                <div className="text-slate-400 italic text-center py-4">Aún no hay jugadas registradas</div>
              ) : (
                <div className="grid grid-cols-2 gap-1 text-slate-200">
                  {moveHistory.map((mv, i) => (
                    <div key={i} className="bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
                      <span className="text-sky-400 font-semibold mr-1">{i + 1}.</span>
                      <span>{mv}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google AdSense Placement (Hidden automatically for Pro users) */}
      <GoogleAdSenseBanner
        user={user}
        slotName="Arena de Ajedrez"
        format="horizontal"
        onOpenFreemium={onOpenFreemium}
      />

      {/* MODAL CEREMONIAL DE VICTORIA / JAQUE MATE */}
      {gameStatus !== 'active' && victoryDetails && !isVictoryModalDismissed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto p-6 text-center space-y-4">
            {/* Crown & Trophy Insignia */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-300">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Fin de la Partida • Motor chess.js
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">{victoryDetails.title}</h2>
              <p className="text-xs text-slate-300">{victoryDetails.subtitle}</p>
            </div>

            {/* Explanation card */}
            <div className="p-3 bg-slate-800/70 rounded-2xl border border-slate-700 text-xs text-slate-200">
              <p>{victoryDetails.reason}</p>
            </div>

            {/* Rewards Breakdown */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-2.5">
                <div className="text-[10px] text-amber-400 font-bold uppercase">ELO Rating</div>
                <div className="text-lg font-black text-white font-mono">
                  {victoryDetails.eloGained > 0 ? `+${victoryDetails.eloGained}` : victoryDetails.eloGained}
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-400/40 rounded-xl p-2.5">
                <div className="text-[10px] text-sky-300 font-bold uppercase">Sabiduría XP</div>
                <div className="text-lg font-black text-white font-mono">+{victoryDetails.xpGained}</div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/40 rounded-xl p-2.5">
                <div className="text-[10px] text-yellow-300 font-bold uppercase">Chakanas</div>
                <div className="text-lg font-black text-white font-mono">+{victoryDetails.chakanasGained} 💎</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleResetGame}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Jugar Nueva Partida</span>
              </button>

              <button
                onClick={() => {
                  setIsVictoryModalDismissed(true);
                  playChime('click');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Examinar Posición Final en el Tablero</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
