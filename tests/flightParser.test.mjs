import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOpenSkyResponse,
  adsbToStateVector,
  adsbResponseToStates,
} from '../lib/flightParser.js';

test('parseOpenSkyResponse keeps flights at 0 lat or 0 lon and drops null coords', () => {
  const data = {
    states: [
      ['a1b2c3', 'UAL123 ', 'United States', 100, 101, 0, 0, 10000, false, 250, 90, 0, null, 10100, '1200', false, 0],
      ['d4e5f6', 'BAW456', 'United Kingdom', 100, 101, null, 51.5, 9000, false, 230, 180, 0, null, 9100, '2000', false, 0],
    ],
  };
  const parsed = parseOpenSkyResponse(data);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].icao24, 'a1b2c3');
  assert.equal(parsed[0].callsign, 'UAL123');
  assert.equal(parsed[0].latitude, 0);
  assert.equal(parsed[0].longitude, 0);
});

test('adsbToStateVector normalizes ADS-B.lol v2 fields to OpenSky state vector', () => {
  const nowSec = 1700000000;
  const ac = {
    hex: 'A1B2C3',
    flight: 'UAL123  ',
    r: 'N12345',
    lat: 37.62,
    lon: -122.38,
    alt_baro: 30000,
    alt_geom: 30500,
    gs: 450,
    track: 270,
    baro_rate: 1000,
    squawk: '1200',
    seen: 5,
    seen_pos: 2,
  };
  const state = adsbToStateVector(ac, nowSec);
  assert.ok(Array.isArray(state));
  assert.equal(state.length, 18);
  assert.equal(state[0], 'a1b2c3');
  assert.equal(state[1], 'UAL123');
  assert.equal(state[3], nowSec - 2);
  assert.equal(state[4], nowSec - 5);
  assert.equal(state[5], -122.38);
  assert.equal(state[6], 37.62);
  assert.equal(state[7], Math.round(30000 * 0.3048));
  assert.equal(state[8], false);
  assert.equal(state[9], Number((450 * 0.514444).toFixed(2)));
  assert.equal(state[10], 270);
  assert.equal(state[14], '1200');
});

test('adsbToStateVector handles alt_baro === "ground"', () => {
  const state = adsbToStateVector({
    hex: 'abc123',
    lat: 0,
    lon: 0,
    alt_baro: 'ground',
    gs: 12,
  }, 1700000000);
  assert.equal(state[7], 0);
  assert.equal(state[8], true);
});

test('adsbResponseToStates handles both array and object-map ac payloads', () => {
  const fromArray = adsbResponseToStates({
    ac: [{ hex: '111111', lat: 10, lon: 20 }, { hex: '222222', lat: null, lon: 20 }],
  });
  assert.equal(fromArray.length, 1);
  assert.equal(fromArray[0][0], '111111');

  const fromMap = adsbResponseToStates({
    ac: { a: { icao: '333333', lat: -5, lon: 15 } },
  });
  assert.equal(fromMap.length, 1);
  assert.equal(fromMap[0][0], '333333');
});
