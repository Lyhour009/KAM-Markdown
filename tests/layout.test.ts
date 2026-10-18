import test from 'node:test'
import assert from 'node:assert/strict'

function clampSplitRatio(ratio: number, min = 20, max = 80): number {
  return Math.min(Math.max(ratio, min), max)
}

test('Layout: clampSplitRatio enforces panel minimum bounds', () => {
  assert.equal(clampSplitRatio(50), 50)
  assert.equal(clampSplitRatio(10), 20) // clamped to min
  assert.equal(clampSplitRatio(95), 80) // clamped to max
  assert.equal(clampSplitRatio(25), 25)
  assert.equal(clampSplitRatio(75), 75)
})
