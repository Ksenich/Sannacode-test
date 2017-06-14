mocha.setup('tdd');
var assert = chai.assert;
var expect = chai.expect;

suite('tokenize', function () {
  test('single digit numbers', function () {
    assert.deepEqual(tokenize('1+2').map(v => v.value), [1, '+', 2])
  });

  test('multiple digit numbers', function () {
    assert.deepEqual(tokenize('78*56').map(v => v.value), [78, '*', 56])
  });

  test('numbers with point', function () {
    assert.deepEqual(tokenize('23.5*2').map(v => v.value), [23.5, '*', 2])
  });

  test('exceptions', function(){
    expect(function(){
      tokenize('safdgfh');
    }).to.throw(/at 0/);
    expect(function(){
      tokenize('1 + ( 5 * 6afdsg');
    }).to.throw(/at 11/);
    expect(function(){
      tokenize('1 + 5.5.5');
    }).to.throw(/at 4/);
  });
});

suite('calculate', function () {
  test('single expression', function () {
    assert.equal(calculate(tokenize('1+2')), 3);
    assert.equal(calculate(tokenize('1-2')), -1);
    assert.equal(calculate(tokenize('2*3')), 6);
    assert.equal(calculate(tokenize('1/2')), 0.5);
    assert.equal(calculate(tokenize('2^3')), 8);
  });

  test('priority', function () {
    assert.equal(calculate(tokenize('2 + 3 * 4')), 14);
    assert.equal(calculate(tokenize('2 * 3 + 4')), 10);
    assert.equal(calculate(tokenize('2 ^ 3 * 1 ^ 2')), 8);
    assert.equal(calculate(tokenize('2 ^ 3 * 1 ^ 2 + 4 ^ 2 * 5')), 88);
  });

  test('parentheses', function () {
    assert.equal(calculate(tokenize('(2 + 3) * 4')), 20);
    assert.equal(calculate(tokenize('4 * (2 + 3)')), 20);
    assert.equal(calculate(tokenize('4 * (2 - (3 + 5))')), -24);
    assert.equal(calculate(tokenize('4 * (2 - 3 + 5)')), 16);
    assert.equal(calculate(tokenize('3 + 2 * 4 + (6 - 2) / 3')), 12 + 1 / 3);
  });

  test('associativity', function () {
    assert.equal(calculate(tokenize('2 ^ 3 ^ 2')), 512); //
    assert.equal(calculate(tokenize('(2 ^ 3) ^ 2')), 64); //
  });

  test('exceptions', function(){
    expect(function(){
      calculate(tokenize('1 + ( 5 * 6'));
    }).to.throw(/"\(" at 4/);
    expect(function(){
      calculate(tokenize('1 +  5 * 6)'));
    }).to.throw(/"\)" at 10/);
    expect(function(){
      calculate(tokenize('1 +  5 * - 6'));
    }).to.throw();
    expect(function(){
      calculate(tokenize('1 +  5 * 6 6'));
    }).to.throw();
  });
});

mocha.run();
