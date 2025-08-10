/**
 * Evaluates proprietary criteria expressions against a state object.
 *
 * Supported syntax examples:
 * - {fieldId} icontains 'yes'
 * - {fieldId} noticontains 'no'
 * - {a} icontains 'x' and {b} icontains 'y' or {c} noticontains 'z'
 * - Parentheses are supported for explicit grouping: ({a} icontains 'x' and {b} icontains 'y') or {c} noticontains 'z'
 *
 * Operator semantics:
 * - icontains: case-insensitive substring match. For arrays, any element matching suffices.
 * - noticontains: negation of icontains.
 * - contains: case-sensitive substring match. For arrays, any element matching suffices.
 * - equals/==: case-insensitive equality. For arrays, any element equal (case-insensitive) suffices.
 * - notequals/!=: negation of equals.
 *
 * Logical precedence: AND binds tighter than OR.
 */

type State = Record<string, unknown>;

// Tokenizer
enum TokenType {
  VAR, // {identifier}
  STRING, // 'value'
  OP, // comparator op
  AND,
  OR,
  LPAREN,
  RPAREN,
  EOF,
}

type Token = {
  type: TokenType;
  value?: string;
};

const OPERATOR_WORDS = [
  'icontains',
  'noticontains',
  'contains',
  'equals',
  'notequals',
  '==',
  '!=',
];

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isWhitespace = (c: string) => /\s/.test(c);
  const isWordChar = (c: string) => /[A-Za-z_!=]/.test(c);

  while (i < input.length) {
    const ch = input[i];
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    if (ch === '{') {
      // Read until '}'
      i++;
      let name = '';
      while (i < input.length && input[i] !== '}') {
        name += input[i++];
      }
      if (i < input.length && input[i] === '}') i++;
      tokens.push({ type: TokenType.VAR, value: name.trim() });
      continue;
    }

    if (ch === '\'') {
      // Read quoted string
      i++; // skip opening quote
      let str = '';
      while (i < input.length) {
        const c = input[i++];
        if (c === '\'') {
          break;
        }
        // support simple escaped quote '' -> '
        if (c === '\\' && input[i] === '\'') {
          str += '\'';
          i++;
        } else {
          str += c;
        }
      }
      tokens.push({ type: TokenType.STRING, value: str });
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: TokenType.LPAREN });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: TokenType.RPAREN });
      i++;
      continue;
    }

    if (isWordChar(ch)) {
      let word = '';
      while (i < input.length && isWordChar(input[i])) {
        word += input[i++];
      }
      const lower = word.toLowerCase();
      if (lower === 'and') {
        tokens.push({ type: TokenType.AND });
      } else if (lower === 'or') {
        tokens.push({ type: TokenType.OR });
      } else if (OPERATOR_WORDS.includes(lower)) {
        tokens.push({ type: TokenType.OP, value: lower });
      } else {
        // Unknown bare word; attempt to treat as operator if it matches case-sensitively
        if (OPERATOR_WORDS.includes(word)) {
          tokens.push({ type: TokenType.OP, value: word });
        } else {
          // Ignore unknown token by skipping; keeps parser resilient
        }
      }
      continue;
    }

    // Unrecognized character, skip
    i++;
  }

  tokens.push({ type: TokenType.EOF });
  return tokens;
}

// Helpers for comparisons
function toComparableStrings(value: unknown): string[] {
  if (value == null) return [''];
  if (Array.isArray(value)) return value.map((v) => String(v ?? ''));
  return [String(value)];
}

function opIContains(actual: unknown, expected: string): boolean {
  const expectedLower = expected.toLowerCase();
  const values = toComparableStrings(actual);
  return values.some((v) => v.toLowerCase().includes(expectedLower));
}

function opContains(actual: unknown, expected: string): boolean {
  const values = toComparableStrings(actual);
  return values.some((v) => v.includes(expected));
}

function opEquals(actual: unknown, expected: string): boolean {
  const expectedLower = expected.toLowerCase();
  const values = toComparableStrings(actual);
  return values.some((v) => v.toLowerCase() === expectedLower);
}

function evalComparison(op: string, actual: unknown, expected: string): boolean {
  switch (op) {
    case 'icontains':
      return opIContains(actual, expected);
    case 'noticontains':
      return !opIContains(actual, expected);
    case 'contains':
      return opContains(actual, expected);
    case 'equals':
    case '==':
      return opEquals(actual, expected);
    case 'notequals':
    case '!=':
      return !opEquals(actual, expected);
    default:
      return false;
  }
}

// Parser/Evaluator (recursive descent with precedence)
class Parser {
  private tokens: Token[];
  private index = 0;
  private state: State;

  constructor(tokens: Token[], state: State) {
    this.tokens = tokens;
    this.state = state;
  }

  private peek(): Token {
    return this.tokens[this.index] ?? { type: TokenType.EOF };
  }

  private consume(): Token {
    return this.tokens[this.index++] ?? { type: TokenType.EOF };
  }

  private match(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.consume();
      return true;
    }
    return false;
  }

  evaluate(): boolean {
    try {
      const result = this.parseOr();
      return Boolean(result);
    } catch {
      return false;
    }
  }

  // or := and (OR and)*
  private parseOr(): boolean {
    let left = this.parseAnd();
    while (this.match(TokenType.OR)) {
      const right = this.parseAnd();
      left = Boolean(left || right);
    }
    return left;
  }

  // and := primary (AND primary)*
  private parseAnd(): boolean {
    let left = this.parsePrimary();
    while (this.match(TokenType.AND)) {
      const right = this.parsePrimary();
      left = Boolean(left && right);
    }
    return left;
  }

  // primary := '(' or ')' | comparison
  private parsePrimary(): boolean {
    if (this.match(TokenType.LPAREN)) {
      const value = this.parseOr();
      // Best-effort: consume a matching RPAREN if present
      if (this.peek().type === TokenType.RPAREN) this.consume();
      return value;
    }
    return this.parseComparison();
  }

  // comparison := VAR OP STRING
  private parseComparison(): boolean {
    const varToken = this.consume();
    if (varToken.type !== TokenType.VAR) return false;

    const opToken = this.consume();
    if (opToken.type !== TokenType.OP || !opToken.value) return false;

    const valueToken = this.consume();
    if (valueToken.type !== TokenType.STRING || typeof valueToken.value !== 'string') return false;

    const actual = this.state[varToken.value as string];
    return evalComparison(opToken.value, actual, valueToken.value);
  }
}

export function evaluate(expression: string, state: State): boolean {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens, state);
  return parser.evaluate();
}

export default evaluate;


