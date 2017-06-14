function evaluate(str) {
  return calculate(tokenize(str));
}

function tokenize(str) {
  //maybe try fsm?
  //1-number, 3 - operator, 4 - space, 5 - ?
  var re = /((\d|\.)+)|(\+|-|\/|\*|\(|\)|\^)|(\s)|(.)/g
  var m, result = [];
  while (m = re.exec(str)) {
    //number
    if (m[1]) result.push(m[1]);
    //operator
    if (m[3]) result.push(m[3]);

    if (m[5]) throw new Error('malformed input');
  }
  return result;
}

function isNumber(str) {
  var num = parseFloat(str, 10);
  if (!isNaN(num))
    return num;
  return null;
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

function isOperator(str) {
  return operators[str] || null;
}
/**
 * uses shanting-yard algorithm to evaluate list of tokens as arithmetical expression
 * @param {[string]} list 
 */
function calculate(list) {
  var token;
  var outputQueue = [];
  var operatorStack = [];
  function OQPush(op) {
    // console.log(outputQueue, op.operator);
    var v1 = outputQueue.pop();
    var v2 = outputQueue.pop();
    outputQueue.push(op.apply(v2, v1));
  }
  // uncomment for converting to inverse polish notation instead
  // function OQPush(op) {
  //   outputQueue.push(op.operator);
  // }
  while (token = list.shift()) {
    var num, op;
    if ((num = isNumber(token)) !== null) {
      outputQueue.push(num);
    } else if ((op = isOperator(token)) !== null) {
      var topOp;
      while (topOp = operatorStack[operatorStack.length - 1]) {
        if (
          (op.associativity === 'left' && topOp.precedence >= op.precedence) ||
          (topOp.precedence > op.precedence)
        ) {
          operatorStack.pop();
          OQPush(topOp);
        } else {
          break;
        }
      }
      operatorStack.push(op);
    } else if (token === '(') {
      operatorStack.push({
        operator: '(',
        apply: () => { throw new Error('unmatched left parenthesis') }
      });
    } else if (token === ')') {
      var topOp;
      while ((topOp = operatorStack[operatorStack.length - 1])) {
        operatorStack.pop();
        if (topOp.operator === '(') {
          break;
        } else {
          OQPush(topOp);
        }
      }
      if (!topOp) {
        throw new Error('unmatched right parenthesis');
      }
    } else {
      throw new Error('malformed input');
    }
  }
  while (op = operatorStack.pop()) {
    OQPush(op);
  }
  // return outputQueue
  return outputQueue[0];
}