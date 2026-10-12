import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDuration, formatPeriod, formatSpan } from '../src/site/content.ts';

const today = new Date(2026, 9, 12); // 12 October 2026

test('periods read naturally in both languages', () => {
  assert.equal(formatPeriod('2023-05', null, 'FR'), 'mai 2023 à aujourd’hui');
  assert.equal(formatPeriod('2023-05', null, 'EN'), 'May 2023 to present');
  assert.equal(formatPeriod('2022-06', '2022-10', 'FR'), 'juin à oct. 2022');
  assert.equal(formatPeriod('2022-06', '2022-10', 'EN'), 'Jun to Oct 2022');
  assert.equal(formatPeriod('2021-09', '2021-09', 'FR'), 'sept. 2021');
  assert.equal(formatPeriod('2020', '2023', 'FR'), '2020 à 2023');
  assert.equal(formatPeriod('2025', '2025', 'EN'), '2025');
});

test('durations count whole months, both ends included, or whole years', () => {
  assert.equal(formatDuration('2023-05', null, 'FR', today), '3 ans 6 mois');
  assert.equal(formatDuration('2023-05', null, 'EN', today), '3 years 6 months');
  assert.equal(formatDuration('2022-06', '2022-10', 'FR'), '5 mois');
  assert.equal(formatDuration('2021-09', '2021-09', 'EN'), '1 month');
  assert.equal(formatDuration('2023', '2025', 'FR'), '2 ans');
  assert.equal(formatDuration('2020', '2023', 'EN'), '3 years');
  assert.equal(formatDuration('2025', '2025', 'FR'), '');
});

test('the span joins both, and leaves out an empty duration', () => {
  assert.equal(formatSpan('2022-06', '2022-10', 'FR'), 'juin à oct. 2022\u00a0· 5 mois');
  assert.equal(formatSpan('2025', '2025', 'FR'), '2025');
});
