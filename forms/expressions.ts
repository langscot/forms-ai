/**
 * Evaluates proprietary default value expressions against a state object.
 *
 * Supported primitives:
 * - Variable lookup: {field} or nested {a/b/c}. Suffix ":display" supported, e.g. {address:display}
 * - String literals: 'text' or "text" (supports simple escapes for the same quote)
 * - Boolean literals: true, false
 * - Concatenation with +, e.g. 'A_' + {B} + '_C'
 * - Functions:
 *   - if(condition, whenTrue, whenFalse)
 *     - condition supports equality with "is": {A} is '' | {A} is true | {A} is {B}
 *   - replaceAll(value, search, replacement)
 *
 * Fallback: If the input string does not appear to be an expression (no braces, quotes,
 * functions, or operators), the raw string is returned as-is.
 */

type State = Record<string, unknown>;

enum TokenType {
  VAR, // {identifier}
  STRING, // 'value' or "value"
  BOOLEAN, // true | false
  IDENT, // identifiers like if, replaceAll (parser matches them explicitly)
  COMMA, // ,
  PLUS, // +
  LPAREN, // (
  RPAREN, // )
  IS, // is
  EOF,
}

type Token = {
  type: TokenType;
  value?: string;
};

function seemsLikePlainLiteral(input: string): boolean {
  const s = input.trim();
  if (s.length === 0) return true;
  // If it includes any expression indicators, it's not a plain literal
  const indicators = ['{', '}', "'", '"', '+', '(', ')', ','];
  if (indicators.some((c) => s.includes(c))) return false;
  // starts with known function names
  const lower = s.toLowerCase();
  if (lower.startsWith('if(') || lower.startsWith('replaceall(')) return false;
  // boolean literals are expressions
  if (lower === 'true' || lower === 'false') return false;
  // contains comparator keyword
  if (/(^|\s)is(\s|$)/i.test(s)) return false;
  return true;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isWhitespace = (c: string) => /\s/.test(c);
  const isIdentifierStart = (c: string) => /[A-Za-z_]/.test(c);
  const isIdentifierChar = (c: string) => /[A-Za-z0-9_]/.test(c);

  while (i < input.length) {
    const ch = input[i];
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    if (ch === '{') {
      i++;
      let name = '';
      while (i < input.length && input[i] !== '}') {
        name += input[i++];
      }
      if (i < input.length && input[i] === '}') i++;
      tokens.push({ type: TokenType.VAR, value: name.trim() });
      continue;
    }

    if (ch === '\'' || ch === '"') {
      const quote = ch;
      i++; // skip opening quote
      let str = '';
      while (i < input.length) {
        const c = input[i++];
        if (c === quote) {
          break;
        }
        if (c === '\\' && input[i] === quote) {
          str += quote;
          i++;
        } else {
          str += c;
        }
      }
      tokens.push({ type: TokenType.STRING, value: str });
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: TokenType.COMMA });
      i++;
      continue;
    }

    if (ch === '+') {
      tokens.push({ type: TokenType.PLUS });
      i++;
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

    if (isIdentifierStart(ch)) {
      let word = '';
      while (i < input.length && isIdentifierChar(input[i])) {
        word += input[i++];
      }
      const lower = word.toLowerCase();
      if (lower === 'true' || lower === 'false') {
        tokens.push({ type: TokenType.BOOLEAN, value: lower });
      } else if (lower === 'is') {
        tokens.push({ type: TokenType.IS });
      } else {
        tokens.push({ type: TokenType.IDENT, value: word });
      }
      continue;
    }

    // Unrecognized character, skip to avoid parser failure
    i++;
  }

  tokens.push({ type: TokenType.EOF });
  return tokens;
}

function toComparableStrings(value: unknown): string[] {
  if (value == null) return [''];
  if (Array.isArray(value)) return value.map((v) => String(v ?? ''));
  return [String(value)];
}

function areLooselyEqual(a: unknown, b: unknown): boolean {
  const aVals = toComparableStrings(a).map((v) => v.toLowerCase());
  const bVals = toComparableStrings(b).map((v) => v.toLowerCase());
  return aVals.some((av) => bVals.includes(av));
}

function asString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return String(value);
  } catch {
    return '';
  }
}

function getValueFromStatePath(state: State, rawPath: string): unknown {
  // Support suffix ":display" on the final segment or any segment
  const segments = rawPath.split('/');
  let current: unknown = state;
  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx].trim();
    if (!seg) {
      current = undefined;
      break;
    }
    const [key, pseudo] = seg.split(':');
    if (current != null && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key as keyof Record<string, unknown>];
    } else {
      current = undefined;
    }
    if (pseudo && current != null && typeof current === 'object') {
      // only known pseudo is "display"; otherwise try generic property
      current = (current as Record<string, unknown>)[
        pseudo as keyof Record<string, unknown>
      ];
    }
  }
  return current;
}

// AST node types
type ExprNode =
  | { kind: 'string'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'var'; path: string }
  | { kind: 'concat'; parts: ExprNode[] }
  | { kind: 'call'; name: 'if' | 'replaceAll'; args: ExprNode[] };

type CondNode =
  | { kind: 'equals'; left: ExprNode; right: ExprNode }
  | { kind: 'bool'; value: boolean };

class Parser {
  private tokens: Token[];
  private index = 0;
  private input: string;

  constructor(tokens: Token[], originalInput: string) {
    this.tokens = tokens;
    this.input = originalInput;
  }

  private peek(): Token {
    return this.tokens[this.index] ?? { type: TokenType.EOF };
  }

  private consume(): Token {
    return this.tokens[this.index++] ?? { type: TokenType.EOF };
  }

  private match(type: TokenType, value?: string): boolean {
    const tok = this.peek();
    if (tok.type !== type) return false;
    if (value != null && tok.value?.toLowerCase() !== value.toLowerCase()) return false;
    this.consume();
    return true;
  }

  parseExpression(): ExprNode | null {
    try {
      const expr = this.parseConcat();
      return expr;
    } catch {
      return null;
    }
  }

  // concat := term (PLUS term)*
  private parseConcat(): ExprNode {
    const parts: ExprNode[] = [];
    parts.push(this.parseTerm());
    while (this.match(TokenType.PLUS)) {
      parts.push(this.parseTerm());
    }
    if (parts.length === 1) return parts[0];
    return { kind: 'concat', parts };
  }

  // term := string | boolean | var | functionCall | '(' expression ')'
  private parseTerm(): ExprNode {
    const tok = this.peek();
    if (tok.type === TokenType.STRING && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'string', value: tok.value };
    }
    if (tok.type === TokenType.BOOLEAN && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'boolean', value: tok.value === 'true' };
    }
    if (tok.type === TokenType.VAR && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'var', path: tok.value };
    }
    if (tok.type === TokenType.IDENT && typeof tok.value === 'string') {
      const ident = tok.value;
      if (ident.toLowerCase() === 'if') return this.parseIfCall();
      if (ident.toLowerCase() === 'replaceall') return this.parseReplaceAllCall();
      // Unknown identifier -> treat as parse error
    }
    if (this.match(TokenType.LPAREN)) {
      const inner = this.parseConcat();
      // consume optional ')'
      if (this.peek().type === TokenType.RPAREN) this.consume();
      return inner;
    }
    // If we reach here, fail the parse
    throw new Error('parse error');
  }

  private parseIfCall(): ExprNode {
    // consume 'if'
    this.consume();
    if (!this.match(TokenType.LPAREN)) throw new Error('expected (');
    const cond = this.parseCondition();
    if (!this.match(TokenType.COMMA)) throw new Error('expected , after condition');
    const whenTrue = this.parseConcat();
    if (!this.match(TokenType.COMMA)) throw new Error('expected , after true branch');
    const whenFalse = this.parseConcat();
    if (!this.match(TokenType.RPAREN)) {
      // best effort: allow missing closing paren
    }
    return { kind: 'call', name: 'if', args: [this.wrapCondition(cond), whenTrue, whenFalse] };
  }

  private wrapCondition(cond: CondNode): ExprNode {
    // Represent condition as a synthetic function call arg node using a special marker
    // We'll handle evaluation specially; here we just wrap to satisfy the ExprNode type
    return { kind: 'string', value: JSON.stringify({ __cond: cond }) };
  }

  private parseReplaceAllCall(): ExprNode {
    // consume 'replaceAll'
    this.consume();
    if (!this.match(TokenType.LPAREN)) throw new Error('expected (');
    const value = this.parseConcat();
    if (!this.match(TokenType.COMMA)) throw new Error('expected ,');
    const search = this.parseConcat();
    if (!this.match(TokenType.COMMA)) throw new Error('expected ,');
    const replacement = this.parseConcat();
    if (!this.match(TokenType.RPAREN)) {
      // allow missing )
    }
    return { kind: 'call', name: 'replaceAll', args: [value, search, replacement] };
  }

  private parseCondition(): CondNode {
    // condition := boolean | operand IS operand
    const first = this.peek();
    if (first.type === TokenType.BOOLEAN && typeof first.value === 'string') {
      this.consume();
      return { kind: 'bool', value: first.value === 'true' };
    }
    const left = this.parseConditionOperand();
    if (!this.match(TokenType.IS)) throw new Error('expected is');
    const right = this.parseConditionOperand();
    return { kind: 'equals', left, right };
  }

  private parseConditionOperand(): ExprNode {
    const tok = this.peek();
    if (tok.type === TokenType.STRING && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'string', value: tok.value };
    }
    if (tok.type === TokenType.BOOLEAN && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'boolean', value: tok.value === 'true' };
    }
    if (tok.type === TokenType.VAR && typeof tok.value === 'string') {
      this.consume();
      return { kind: 'var', path: tok.value };
    }
    if (tok.type === TokenType.IDENT && typeof tok.value === 'string') {
      if (tok.value.toLowerCase() === 'replaceall') {
        return this.parseReplaceAllCall();
      }
    }
    if (this.match(TokenType.LPAREN)) {
      const inner = this.parseConcat();
      if (this.peek().type === TokenType.RPAREN) this.consume();
      return inner;
    }
    throw new Error('invalid condition operand');
  }
}

function evaluateAst(node: ExprNode, state: State): unknown {
  switch (node.kind) {
    case 'string': {
      // Special case: this might be a wrapped condition JSON when used as first arg to if()
      // Detect and return a unique object to signal condition
      try {
        const obj = JSON.parse(node.value);
        if (obj && obj.__cond) return obj; // passthrough
      } catch {
        // ignore
      }
      return node.value;
    }
    case 'boolean':
      return node.value;
    case 'var':
      return getValueFromStatePath(state, node.path);
    case 'concat': {
      return node.parts.map((p) => asString(evaluateAst(p, state))).join('');
    }
    case 'call': {
      if (node.name === 'replaceAll') {
        const raw = asString(evaluateAst(node.args[0], state));
        const search = asString(evaluateAst(node.args[1], state));
        const replacement = asString(evaluateAst(node.args[2], state));
        if (search === '') return raw; // avoid infinite split
        return raw.split(search).join(replacement);
      }
      if (node.name === 'if') {
        // First arg is a wrapped condition
        const condWrapped = evaluateAst(node.args[0], state) as any;
        let condValue = false;
        if (condWrapped && typeof condWrapped === 'object' && condWrapped.__cond) {
          condValue = evaluateCondition(condWrapped.__cond as CondNode, state);
        } else {
          // Fallback: truthiness of evaluated arg
          condValue = Boolean(condWrapped);
        }
        if (condValue) return evaluateAst(node.args[1], state);
        return evaluateAst(node.args[2], state);
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

function evaluateCondition(node: CondNode, state: State): boolean {
  switch (node.kind) {
    case 'bool':
      return node.value;
    case 'equals': {
      const left = evaluateAst(node.left, state);
      const right = evaluateAst(node.right, state);
      return areLooselyEqual(left, right);
    }
    default:
      return false;
  }
}

export function evaluateDefaultExpression(input: string, state: State): unknown {
  // Unwrap a single pair of outer quotes if present to allow expressions like 'if(...)'
  if (typeof input !== 'string') return input;
  const trimmed = input.trim();
  let expr = trimmed;
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    expr = trimmed.slice(1, -1);
  }
  if (seemsLikePlainLiteral(expr)) return expr;
  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, expr);
    const ast = parser.parseExpression();
    if (!ast) return expr;
    return evaluateAst(ast, state);
  } catch {
    return expr;
  }
}

export default evaluateDefaultExpression;


