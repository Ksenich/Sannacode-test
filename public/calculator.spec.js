mocha.setup('tdd');
var assert = chai.assert;
var expect = chai.expect;

suite('tokenize', function () {
  test('single digit numbers', function () {
    assert.deepEqual(tokenize('1+2').map(v => v.value), [1, '+', 2]);
  });

  test('multiple digit numbers', function () {
    assert.deepEqual(tokenize('78*56').map(v => v.value), [78, '*', 56]);
  });

  test('numbers with point', function () {
    assert.deepEqual(tokenize('23.5*2').map(v => v.value), [23.5, '*', 2]);
  });

  test('exceptions', function () {
    expect(function () {
      tokenize('safdgfh');
    }).to.throw(/at 0/);
    expect(function () {
      tokenize('1 + ( 5 * 6afdsg');
    }).to.throw(/at 11/);
    expect(function () {
      tokenize('1 + 5.5.5');
    }).to.throw(/at 4/);

    // no unary minus support
    // expect(function () {
    //   tokenize('1 +  5 * - 6');
    // }).to.throw('Illegal operator at 9');
    expect(function () {
      tokenize('1 +  5 * / 6');
    }).to.throw('Illegal operator at 9');
    expect(function () {
      tokenize('1 +  5 * 6 6');
    }).to.throw('Missing operator at 11');
  });
  test('negative numbers', function () {
    assert.deepEqual(tokenize('5+-6').map(v => v.value), [5, '+', -6]);
    assert.deepEqual(tokenize('-5+-6').map(v => v.value), [-5, '+', -6]);
    // should we allow this?
    // assert.deepEqual(tokenize('-5+--6').map(v => v.value), [-5, '+', 6]);
    assert.deepEqual(tokenize('-5+(-6 -1)').map(v => v.value), [-5, '+', '(', -6, '-', 1, ')']);
  });
});

suite('evaluate', function () {
  test('single expression', function () {
    assert.equal(evaluate('1+2'), 3);
    assert.equal(evaluate('1-2'), -1);
    assert.equal(evaluate('2*3'), 6);
    assert.equal(evaluate('1/2'), 0.5);
    assert.equal(evaluate('2^3'), 8);
  });

  test('priority', function () {
    assert.equal(evaluate('1 + 2 - 4'), -1);
    assert.equal(evaluate('2 + 3 * 4'), 14);
    assert.equal(evaluate('2 * 3 + 4'), 10);
    assert.equal(evaluate('2 ^ 3 * 1 ^ 2'), 8);
    assert.equal(evaluate('2 ^ 3 * 1 ^ 2 + 4 ^ 2 * 5'), 88);
  });

  test('parentheses', function () {
    assert.equal(evaluate('(2 + 3) * 4'), 20);
    assert.equal(evaluate('4 * (2 + 3)'), 20);
    assert.equal(evaluate('4 * (2 - (3 + 5))'), -24);
    assert.equal(evaluate('4 * (2 - 3 + 5)'), 16);
    assert.equal(evaluate('3 + 2 * 4 + (6 - 2) / 3'), 12 + 1 / 3);
  });

  test('associativity', function () {
    assert.equal(evaluate('2 ^ 3 ^ 2'), 512); //
    assert.equal(evaluate('(2 ^ 3) ^ 2'), 64); //
  });

  test('exceptions', function () {
    expect(function () {
      evaluate('1 + ( 5 * 6');
    }).to.throw(/"\(" at 4/);
    expect(function () {
      evaluate('1 +  5 * 6)');
    }).to.throw(/"\)" at 10/);
  });

  test('negative numbers', function () {
    assert.equal(evaluate('5+-6'), -1);
    assert.equal(evaluate('-5+-6'), -11);
    // should we allow this?
    // assert.equal(evaluate('-5+--6'), 1);
    assert.equal(evaluate('-5+(-6 -1)'), -12);
  });
});

mocha.run();
