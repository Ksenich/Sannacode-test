mocha.setup('tdd');
var assert = chai.assert;

suite('tokenize', function () {
  test('single digit numbers', function () {
    assert.deepEqual(tokenize('1+2'), ['1', '+', '2'])
  });

  test('multiple digit numbers', function () {
    assert.deepEqual(tokenize('78*56'), ['78', '*', '56'])
  });

  test('numbers with point', function(){
    assert.deepEqual(tokenize('23.5*2'), ['23.5', '*', '2'])
  })
});

suite('calculate', function () {
  test('single expression', function () {
    assert.equal(calculate(['1', '+', '2']), 3);
    assert.equal(calculate(['1', '-', '2']), -1);
    assert.equal(calculate(['1', '*', '2']), 2);
    assert.equal(calculate(['1', '/', '2']), 0.5);
    assert.equal(calculate(['2', '^', '3']), 8);
  });

  test('priority', function () {
    assert.equal(calculate(tokenize('2 + 3 * 4')), 14);
    assert.equal(calculate(tokenize('2 * 3 + 4')), 10);
    assert.equal(calculate(tokenize('2 ^ 3 * 1 ^ 2')), 8);
    assert.equal(calculate(tokenize('2 ^ 3 * 1 ^ 2 + 4 ^ 2 * 5')), 88);
  });

  test('parentheses', function () {
    assert.equal(calculate(tokenize('(2+3)*4')), 20);
    assert.equal(calculate(tokenize('4*(2+3)')), 20);
    assert.equal(calculate(tokenize('3 + 2 * 4 + (6 - 2) / 3')), 12 + 1 / 3);
  });
  
  test('associativity', function () {
    assert.equal(calculate(tokenize('2^3^2')), 512); //
    assert.equal(calculate(tokenize('(2^3)^2')), 64); //
  });
});
mocha.run();