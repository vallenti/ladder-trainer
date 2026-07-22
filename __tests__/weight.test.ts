import { formatLoad, fromKg, roundedDisplayWeight, toKg } from '../src/utils/weight';

describe('weight conversion', () => {
  it('rounds converted display values to whole units', () => {
    expect(roundedDisplayWeight(toKg(100, 'lb'), 'kg')).toBe(45);
    expect(roundedDisplayWeight(20, 'lb')).toBe(44);
  });

  it('keeps exact conversion values internally', () => {
    expect(fromKg(toKg(100, 'lb'), 'lb')).toBeCloseTo(100);
  });

  it('formats a load in its selected display unit', () => {
    expect(formatLoad({ valueKg: 20, displayUnit: 'lb' })).toBe('44 lb');
  });
});
