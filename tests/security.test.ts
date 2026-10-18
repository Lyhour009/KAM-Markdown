import test from 'node:test'
import assert from 'node:assert/strict'
import { isSafeUrl, validateMarkdownFile, MAX_FILE_SIZE_BYTES } from '../src/utils/securityUtils.ts'

test('Security: isSafeUrl rejects malicious schemes', () => {
  assert.equal(isSafeUrl('javascript:alert(1)'), false)
  assert.equal(isSafeUrl('JAVASCRIPT:alert(1)'), false)
  assert.equal(isSafeUrl('javascript:/*--></title></style></textarea></script><svg/onload=alert`1`>'), false)
  assert.equal(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), false)
  assert.equal(isSafeUrl('vbscript:msgbox("XSS")'), false)
  assert.equal(isSafeUrl('file:///etc/passwd'), false)
  assert.equal(isSafeUrl(''), false)
  assert.equal(isSafeUrl(undefined), false)
})

test('Security: isSafeUrl permits safe protocols & relative links', () => {
  assert.equal(isSafeUrl('https://example.com'), true)
  assert.equal(isSafeUrl('http://example.com'), true)
  assert.equal(isSafeUrl('mailto:contact@example.com'), true)
  assert.equal(isSafeUrl('/docs/readme'), true)
  assert.equal(isSafeUrl('#heading-1'), true)
  assert.equal(isSafeUrl('./guide.md'), true)
})

test('Security: validateMarkdownFile enforces 500 KB limit', () => {
  // Small file (100 KB)
  const smallMockFile = {
    size: 100 * 1024,
    name: 'valid.md',
  } as unknown as File
  const smallResult = validateMarkdownFile(smallMockFile)
  assert.equal(smallResult.isValid, true)

  // Exact boundary (500 KB)
  const exactMockFile = {
    size: MAX_FILE_SIZE_BYTES,
    name: 'exact.md',
  } as unknown as File
  const exactResult = validateMarkdownFile(exactMockFile)
  assert.equal(exactResult.isValid, true)

  // Oversized file (501 KB)
  const oversizedMockFile = {
    size: MAX_FILE_SIZE_BYTES + 1024,
    name: 'oversized.md',
  } as unknown as File
  const oversizedResult = validateMarkdownFile(oversizedMockFile)
  assert.equal(oversizedResult.isValid, false)
  assert.equal(oversizedResult.errorKey, 'fileTooLarge')
})
