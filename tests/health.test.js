/**
 * Health endpoint smoke test (no database required).
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_with_at_least_32_chars';
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
});

test('GET /api/jugadores without auth returns 401', async () => {
    const res = await request(app).get('/api/jugadores');
    assert.equal(res.status, 401);
});
