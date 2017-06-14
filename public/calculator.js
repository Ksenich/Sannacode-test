function evaluate(str) {
  return calculate(tokenize(str));
}

function tokenize(str) {
  // 1-number, 3 - operator, 6 - space, 7 - ?
  var re = /((\d|\.)+)|(\+|-|\/|\*|\^)|(\()|(\))|(\s)|(.)/g
  //        12         3               4    5    6    7    
  var m, result = [];
  var token, prevToken = { type: null }, negate = false;
  while (m = re.exec(str)) {
    token = null;
    // number
    if (m[1]) {
      var value = parseFloat(m[1], 10);
      if (isNaN(value) || value != m[1]) {
        throw new Error('Invalid number at ' + m.index)
      }
      if (negate) {
        value = -value;
        negate = false;
      }
      token = {
        type: 'number',
        value: value,
        index: m.index,
      };
    }
    // operator
    if (m[3]) token = {
      type: 'operator',
      value: m[3],
      index: m.index
    };
    if (m[4]) token = {
      type: 'lp',
      value: m[4],
      index: m.index
    };
    if (m[5]) token = {
      type: 'rp',
      value: m[5],
      index: m.index
    };
    if (m[7]) throw new Error('Malformed input: "' + m[7] + '" at ' + m.index);
    if (token) {
      if (token.type === 'operator' && !(prevToken.type === 'number' || prevToken.type === 'rp')) {
        if (token.value === '-' && !negate) {
          negate = !negate;
          continue;
        } else {
          throw new Error('Illegal operator at ' + token.index);
        }
      }
      if (token.type === 'number' && prevToken.type === 'number') {
        throw new Error('Missing operator at ' + token.index);
      }
      result.push(token);
      prevToken = token;
    }
  }
  return result;
}

function op(o, p, f, a) {
  return {
    operator: o,
    precedence: p,
    associativity: a ? 'right' : 'left',
    apply: f,
  }
}

var operators = {
  '+': op('+', 2, (a, b) => a + b),
  '-': op('-', 2, (a, b) => a - b),
  '/': op('/', 3, (a, b) => a / b),
  '*': op('*', 3, (a, b) => a * b),
  '^': op('^', 4, (a, b) => Math.pow(a, b), true),
}

/**
 * Uses shunting-yard algorithm to evaluate list of tokens as arithmetical expression
 * @param {[string]} list 
 */
function calculate(list) {
  var token;
  var outputQueue = [];
  var operatorStack = [];
  while (token = list.shift()) {
    switch (token.type) {
      case 'number':
        outputQueue.push(token.value);
        break;
      case 'operator':
        onOperator(outputQueue, operatorStack, token);
        break;
      case 'lp':
        operatorStack.push({
          type: token.type,
          apply: function (token) {
            throw new Error('Unmatched "(" at ' + token.index)
          }.bind(this, token)
        });
        break;
      case 'rp':
        onRightParens(outputQueue, operatorStack, token);
        break;
      default:
    }
  }
  var op;
  while (op = operatorStack.pop()) {
    OQPush(outputQueue, op);
  }
  // return outputQueue
  if (outputQueue.length !== 1) {
    throw new Error('OQ.length = ' + outputQueue.length);
  }
  return outputQueue[0];
}

function onOperator(outputQueue, operatorStack, token) {
  var topOp;
  var op = operators[token.value];
  if (!op) {
    throw new Error('Unknown operator: "' + token.value + '" at ' + token.index);
  }
  while (topOp = operatorStack[operatorStack.length - 1]) {
    if (
      (op.associativity === 'left' && topOp.precedence >= op.precedence) ||
      (topOp.precedence > op.precedence)
    ) {
      operatorStack.pop();
      OQPush(outputQueue, topOp);
    } else {
      break;
    }
  }
  operatorStack.push(op);
}

function onRightParens(outputQueue, operatorStack, token) {
  var topOp;
  while ((topOp = operatorStack[operatorStack.length - 1])) {
    operatorStack.pop();
    if (topOp.type === 'lp') {
      break;
    } else {
      OQPush(outputQueue, topOp);
    }
  }
  if (!topOp) {
    throw new Error('Unmatched ")" at ' + token.index);
  }
}

function OQPush(outputQueue, op) {
  var v1 = outputQueue.pop();
  var v2 = outputQueue.pop();
  if (v1 === void 0 || v2 === void 0) {
    throw new Error('OQ too short.')
  }
  outputQueue.push(op.apply(v2, v1));
}
