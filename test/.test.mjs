import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parse,
  Node,
  STYLESHEET_NODE,
  BLOCK_NODE,
  WHITESPACE_NODE,
  COMMENT_NODE,
  SELECTOR_NODE,
  DECLARATION_KEY_NODE,
  DECLARATION_VALUE_NODE,
  WHITESPACE,
  DEFINITION_OF_VALUE,
} from '../0.js';

function createRoot() {
  const root = new Node(STYLESHEET_NODE, '', [], null);
  if (!root.children) root.children = [];
  return root;
}

function runParse(css) {
  const root = createRoot();
  parse(css, root, 0, css.length, Node, Array);
  return root;
}

test('DEFINITION_OF_VALUE and WHITESPACE config are as expected', () => {
  assert.deepEqual(DEFINITION_OF_VALUE, [':', '{']);
  assert.ok(WHITESPACE.includes(' '));
  assert.ok(WHITESPACE.includes('\n'));
});

test('parses pure whitespace into a single WHITESPACE_NODE', () => {
  const css = ' \n\t ';
  const root = runParse(css);
  assert.equal(root.children.length, 1);
  const ws = root.children[0];
  assert.equal(ws.type, WHITESPACE_NODE);
  assert.equal(ws.data, css);
  assert.equal(root.to_string(), css);
});

test('parses "color:red;" at root into key + value nodes', () => {
  const css = 'color:red;';
  const root = runParse(css);
  assert.equal(root.children.length, 4);
  const key = root.children[0];
  const val = root.children[2];
  assert.equal(key.type, DECLARATION_KEY_NODE);
  assert.equal(key.data, 'color');
  assert.equal(val.type, DECLARATION_VALUE_NODE);
  assert.equal(val.data, 'red');
  assert.equal(root.to_string(), css);
});

test('parses spaced declaration "  color  :  red  ;"', () => {
  const css = '  color  :  red  ;';
  const root = runParse(css);
  assert.ok(root.children.length >= 4);
  const ws0 = root.children[0];
  const key = root.children.find(n => n.type === DECLARATION_KEY_NODE);
  const val = root.children.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.equal(ws0.type, WHITESPACE_NODE);
  assert.equal(ws0.data, '  ');
  assert.ok(key);
  assert.equal(key.data, 'color');
  assert.ok(val);
  assert.equal(val.data, 'red');
  assert.equal(root.to_string(), css);
});

test('parses "body{color:red;}" with closed block', () => {
  const css = 'body{color:red;}';
  const root = runParse(css);
  assert.ok(root.children.length >= 2);
  const selector = root.children[0];
  const block = root.children[1];
  assert.equal(selector.type, SELECTOR_NODE);
  assert.equal(selector.data, 'body');
  assert.equal(block.type, BLOCK_NODE);
  assert.ok(Array.isArray(block.children));
  const key = block.children.find(n => n.type === DECLARATION_KEY_NODE);
  const val = block.children.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.ok(key);
  assert.equal(key.data, 'color');
  assert.ok(val);
  assert.equal(val.data, 'red');
  assert.equal(root.to_string(), css);
});

test('parses last declaration before "}" without semicolon', () => {
  const css = 'body { color: red }';
  const root = runParse(css);
  const selector = root.children[0];
  assert.equal(selector.type, SELECTOR_NODE);
  assert.equal(selector.data.trim(), 'body');
  const block = root.children[root.children.length - 1];
  assert.equal(block.type, BLOCK_NODE);
  const inner = block.children;
  const key = inner.find(n => n.type === DECLARATION_KEY_NODE);
  const val = inner.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.ok(key);
  assert.ok(val);
  assert.equal(key.data.trim(), 'color');
  assert.equal(val.data.trim(), 'red');
  assert.equal(root.to_string(), css);
});

test('parses multiple blocks and resets parent correctly', () => {
  const css = 'a{color:red} b{margin:0;}';
  const root = runParse(css);
  const selectors = root.children.filter(n => n.type === SELECTOR_NODE);
  const blocks = root.children.filter(n => n.type === BLOCK_NODE);
  assert.equal(selectors.length, 2);
  assert.equal(blocks.length, 2);
  assert.equal(selectors[0].data.trim(), 'a');
  assert.equal(selectors[1].data.trim(), 'b');
  const blockA = blocks[0];
  const blockB = blocks[1];
  const keyA = blockA.children.find(n => n.type === DECLARATION_KEY_NODE);
  const valA = blockA.children.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.equal(keyA.data.trim(), 'color');
  assert.equal(valA.data.trim(), 'red');
  const keyB = blockB.children.find(n => n.type === DECLARATION_KEY_NODE);
  const valB = blockB.children.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.equal(keyB.data.trim(), 'margin');
  assert.equal(valB.data.trim(), '0');
  assert.equal(root.to_string(), css);
});

test('parses "/*hello*/" into a single COMMENT_NODE', () => {
  const css = '/*hello*/';
  const root = runParse(css);
  assert.equal(root.children.length, 1);
  const comment = root.children[0];
  assert.equal(comment.type, COMMENT_NODE);
  assert.equal(comment.data, 'hello');
  assert.equal(root.to_string(), css);
});

test('parses selector, comment, then declaration', () => {
  const css = 'body{/*x*/color:red;}';
  const root = runParse(css);
  const selector = root.children[0];
  const block = root.children[1];
  assert.equal(selector.type, SELECTOR_NODE);
  assert.equal(block.type, BLOCK_NODE);
  const comment = block.children.find(n => n.type === COMMENT_NODE);
  const key = block.children.find(n => n.type === DECLARATION_KEY_NODE);
  const val = block.children.find(n => n.type === DECLARATION_VALUE_NODE);
  assert.ok(comment);
  assert.equal(comment.data, 'x');
  assert.ok(key);
  assert.ok(val);
  assert.equal(root.to_string(), css);
});

test('WHITESPACE_NODE.to_string() returns its data', () => {
  const node = new Node(WHITESPACE_NODE, '  ', null, null);
  assert.equal(node.to_string(), '  ');
});

test('COMMENT_NODE.to_string() wraps data in delimiters', () => {
  const node = new Node(COMMENT_NODE, 'hi', null, null);
  assert.equal(node.to_string(), '/*hi*/');
});

test('DECLARATION_KEY_NODE and VALUE_NODE to_string() return raw data', () => {
  const key = new Node(DECLARATION_KEY_NODE, 'color', null, null);
  const val = new Node(DECLARATION_VALUE_NODE, 'red', null, null);
  assert.equal(key.to_string(), 'color');
  assert.equal(val.to_string(), 'red');
});

test('STYLESHEET_NODE.to_string() concatenates children via reduce_sm_to_string', () => {
  const ws = new Node(WHITESPACE_NODE, ' ', null, null);
  const comment = new Node(COMMENT_NODE, 'c', null, null);
  const key = new Node(DECLARATION_KEY_NODE, 'color', null, null);
  const val = new Node(DECLARATION_VALUE_NODE, 'red', null, null);
  const sheet = new Node(STYLESHEET_NODE, '', [ws, comment, key, val], null);
  const s = sheet.to_string();
  assert.equal(s, ' /*c*/colorred');
});

test('root.to_string() matches "color:red;"', () => {
  const css = 'color:red;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('root.to_string() preserves whitespace around decl', () => {
  const css = '  color  :  red  ;';
  const root = runParse(css);
  const s = root.to_string();
  assert.equal(s, css);
});

test('roundtrip single declaration without semicolon at root', () => {
  const css = 'color:red';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip multiple declarations at root', () => {
  const css = 'color:red;margin:0;padding:10px;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip multiple declarations with spaces', () => {
  const css = 'color: red; margin : 0 ; padding : 10px  ;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip selector with multiple declarations', () => {
  const css = 'body{color:red;margin:0;padding:10px;}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip selector with spaced declarations', () => {
  const css = 'body { color : red ; margin : 0 ; padding : 10px ; }';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip multiple selectors and blocks tight', () => {
  const css = 'a{color:red}b{margin:0}c{padding:1px;}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip multiple selectors and blocks with spaces', () => {
  const css = 'a { color:red } b { margin:0; } c { padding : 1px }';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip comment at start', () => {
  const css = '/*head*/body{color:red;}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip comment at end', () => {
  const css = 'body{color:red;}/*tail*/';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip comment between declarations', () => {
  const css = 'body{color:red;/*x*/margin:0;}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declarations with many spaces around colon', () => {
  const css = 'color      :      red;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declarations with many spaces before semicolon', () => {
  const css = 'color:red      ;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declarations with tabs and newlines', () => {
  const css = '\tcolor:\nred\t;\r';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('root children types for "  color  :  red  ;"', () => {
  const css = '  color  :  red  ;';
  const root = runParse(css);
  const types = root.children.map(n => n.type);
  assert.deepEqual(types, [
    WHITESPACE_NODE,
    DECLARATION_KEY_NODE,
    WHITESPACE_NODE,
    7,
    WHITESPACE_NODE,
    DECLARATION_VALUE_NODE,
    WHITESPACE_NODE,
    7
  ]);
});

test('block children types for "body{  color  :  red  ; }"', () => {
  const css = 'body{  color  :  red  ; }';
  const root = runParse(css);
  const block = root.children.find(n => n.type === BLOCK_NODE);
  const types = block.children.map(n => n.type);
  assert.deepEqual(types, [
    WHITESPACE_NODE,
    DECLARATION_KEY_NODE,
    WHITESPACE_NODE,
    7,
    WHITESPACE_NODE,
    DECLARATION_VALUE_NODE,
    WHITESPACE_NODE,
    7,
    WHITESPACE_NODE
  ]);
});

test('roundtrip complex whitespace mix', () => {
  const css = ' \n body \t { \n color :\tred ;\nmargin : 0 ;\n}\n';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip multiple rules separated by whitespace', () => {
  const css = 'a{color:red;}\n\nb{color:blue;}\n c {color:green;}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip selector list treated as selector text', () => {
  const css = 'a,b,c { color:red; }';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declaration with numeric value', () => {
  const css = 'width:100px;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declaration with dash in property', () => {
  const css = 'background-color:red;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declaration with dash in value', () => {
  const css = 'font-weight:bold;';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declaration with url-like value', () => {
  const css = 'background:url(x.png);';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip declaration with parentheses in value', () => {
  const css = 'transform:translate(10px, 20px);';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip empty block', () => {
  const css = 'a{}';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('roundtrip block with only whitespace', () => {
  const css = 'a{   \n  \t }';
  const root = runParse(css);
  assert.equal(root.to_string(), css);
});

test('whitespace node count for spaced root declaration', () => {
  const css = '  color  :  red  ;';
  const root = runParse(css);
  const wsCount = root.children.filter(n => n.type === WHITESPACE_NODE).length;
  assert.equal(wsCount, 4);
});

test('one declaration key and one value per simple root rule', () => {
  const css = '  color  :  red  ;';
  const root = runParse(css);
  const keys = root.children.filter(n => n.type === DECLARATION_KEY_NODE);
  const vals = root.children.filter(n => n.type === DECLARATION_VALUE_NODE);
  assert.equal(keys.length, 1);
  assert.equal(vals.length, 1);
});

test('one selector and one block per simple rule', () => {
  const css = 'a{color:red;}';
  const root = runParse(css);
  const selectors = root.children.filter(n => n.type === SELECTOR_NODE);
  const blocks = root.children.filter(n => n.type === BLOCK_NODE);
  assert.equal(selectors.length, 1);
  assert.equal(blocks.length, 1);
});

test('selectors and blocks equal count for multiple rules', () => {
  const css = 'a{color:red;}b{margin:0;}c{padding:1px;}';
  const root = runParse(css);
  const selectors = root.children.filter(n => n.type === SELECTOR_NODE);
  const blocks = root.children.filter(n => n.type === BLOCK_NODE);
  assert.equal(selectors.length, blocks.length);
});

test('comment node content for multiple comments', () => {
  const css = '/*a*/\nbody{/*b*/color:red;/*c*/}/*d*/';
  const root = runParse(css);
  const comments = [];
  function collect(node) {
    if (!node) return;
    if (node.type === COMMENT_NODE) comments.push(node.data);
    if (Array.isArray(node.children)) node.children.forEach(collect);
  }
  collect(root);
  assert.deepEqual(comments, ['a', 'b', 'c', 'd']);
  assert.equal(root.to_string(), css);
});
