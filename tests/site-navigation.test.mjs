import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HOME_HASH, focusDestination, routeFromHash } from '../src/site/navigation.ts';

test('the bare URL shows the poster; section links and the home hash show the home page', () => {
  for (const hash of ['', '#', '#top']) {
    assert.deepEqual(routeFromHash(hash), { page: 'cover' });
  }
  for (const hash of [HOME_HASH, '#contact', '#realisations']) {
    assert.deepEqual(routeFromHash(hash), { page: 'home' });
  }
  assert.deepEqual(routeFromHash('#/realisations'), { page: 'projects' });
  assert.deepEqual(routeFromHash('#/realisations/azure-infra'), {
    page: 'project',
    id: 'azure-infra',
  });
  assert.deepEqual(routeFromHash('#/realisations/projet%20test'), {
    page: 'project',
    id: 'projet test',
  });
});

test('malformed external project links do not throw during route initialisation', () => {
  assert.deepEqual(routeFromHash('#/realisations/%E0%A4%A'), {
    page: 'project',
    id: '%E0%A4%A',
  });
});

test('arrival focuses the section heading without a second focus-induced scroll', (t) => {
  const calls = [];
  const heading = {
    setAttribute: (...args) => calls.push(['attribute', ...args]),
    focus: (options) => calls.push(['focus', options]),
  };
  const section = {
    querySelector: () => heading,
    scrollIntoView: (options) => calls.push(['section-scroll', options]),
  };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      querySelector: () => ({ querySelector: () => heading }),
      getElementById: (id) => (id === 'contact' ? section : null),
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      scrollTo: (options) => calls.push(['page-scroll', options]),
    },
  });
  t.after(() => {
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
    else delete globalThis.document;
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
    else delete globalThis.window;
  });

  focusDestination('#contact');
  assert.deepEqual(calls, [
    ['attribute', 'tabindex', '-1'],
    ['focus', { preventScroll: true }],
    ['section-scroll', { behavior: 'instant', block: 'start' }],
  ]);
  calls.length = 0;
  focusDestination('#/realisations/siem', false);
  assert.equal(
    calls.some(([type]) => type.endsWith('scroll')),
    false,
  );
  calls.length = 0;
  focusDestination('#top');
  assert.deepEqual(calls.at(-1), ['page-scroll', { top: 0, behavior: 'instant' }]);
});
