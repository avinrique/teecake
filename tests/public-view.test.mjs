import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App.tsx';
import { EditModeProvider } from '../src/context/EditModeContext.tsx';
import { TypographyProvider } from '../src/context/TypographyContext.tsx';

Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } });

test('public page renders content and login without exposing edit controls', () => {
  const html = renderToString(React.createElement(EditModeProvider, null,
    React.createElement(TypographyProvider, null, React.createElement(App))));
  assert.ok(html.includes('Admin sign in'));
  assert.ok(html.includes('TeeCake'));
  assert.ok(!html.includes('Master Control'));
  assert.ok(!html.includes('Save Dish &amp; Photo'));
  assert.ok(!html.includes('Unhide Editor'));
});
