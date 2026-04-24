const { isAccidental } = require('../../src/services/interactionService');

describe('Interaction Service — is_accidental', () => {
  test('TC-IT-01: dentro del umbral', () => {
    const created = 0;
    const reverted = 4999;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(true);
  });

  test('TC-IT-02: exactamente en el límite', () => {
    const created = 0;
    const reverted = 5000;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(false);
  });

  test('TC-IT-03: fuera del umbral', () => {
    const created = 0;
    const reverted = 5001;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(false);
  });

  test('TC-IT-04: reversión muy rápida', () => {
    const created = 0;
    const reverted = 100;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(true);
  });

  test('TC-IT-05: sin reversión', () => {
    const created = 0;
    const reverted = null;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(false);
  });

  test('TC-IT-06: gran retraso', () => {
    const created = 0;
    const reverted = 10000;
    const TH = 5000;
    expect(isAccidental(created, reverted, TH)).toBe(false);
  });

  test('TC-IT-07: umbral parametrizado', () => {
    const created = 0;
    const reverted = 4000;
    const TH = 3000;
    expect(isAccidental(created, reverted, TH)).toBe(false);
  });
});
