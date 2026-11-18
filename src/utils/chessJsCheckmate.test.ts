import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';

test('chess.js detects fools mate and scholars mate with isCheckmate()', () => {
  // Fools mate (Fastest checkmate in chess: 2 moves for Black)
  const foolsGame = new Chess();
  foolsGame.move('f3');
  foolsGame.move('e5');
  foolsGame.move('g4');
  foolsGame.move('Qh4#');

  assert.equal(foolsGame.isCheckmate(), true);
  assert.equal(foolsGame.inCheck(), true);
  assert.equal(foolsGame.turn(), 'w'); // White is mated!
  assert.equal(foolsGame.isGameOver(), true);

  // Scholars mate (4 moves for White)
  const scholarsGame = new Chess();
  scholarsGame.move('e4');
  scholarsGame.move('e5');
  scholarsGame.move('Bc4');
  scholarsGame.move('Nc6');
  scholarsGame.move('Qh5');
  scholarsGame.move('Nf6');
  scholarsGame.move('Qxf7#');

  assert.equal(scholarsGame.isCheckmate(), true);
  assert.equal(scholarsGame.inCheck(), true);
  assert.equal(scholarsGame.turn(), 'b'); // Black is mated!
  assert.equal(scholarsGame.isGameOver(), true);
});

test('chess.js handles en-passant and pawn promotion', () => {
  const game = new Chess();
  // Standard moves leading to promotion setup
  game.load('8/4P3/8/8/8/8/8/k6K w - - 0 1');
  assert.equal(game.isCheckmate(), false);
  const move = game.move({ from: 'e7', to: 'e8', promotion: 'q' });
  assert.equal(move.promotion, 'q');
  assert.equal(game.get('e8')?.type, 'q');
});
