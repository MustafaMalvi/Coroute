const { dateKey, weekdayOf, occursOn, effectiveDeparture, validateRideInput } = require('../routes/rides')._internal;

describe('dateKey', () => {
  test('formats a date as YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05'); // Jan 5, 2026
  });

  test('pads single-digit months and days', () => {
    expect(dateKey(new Date(2026, 8, 9))).toBe('2026-09-09'); // Sep 9, 2026
  });
});

describe('weekdayOf', () => {
  test('returns the correct weekday name', () => {
    // August 19, 2026 is a Wednesday
    expect(weekdayOf(new Date(2026, 7, 19))).toBe('Wednesday');
    // August 23, 2026 is a Sunday
    expect(weekdayOf(new Date(2026, 7, 23))).toBe('Sunday');
  });
});

describe('occursOn', () => {
  const baseRide = {
    rideType: 'recurring',
    isPaused: false,
    status: 'Open',
    repeatDays: ['Wednesday', 'Friday'],
    skipDates: []
  };
  const wednesday = new Date(2026, 7, 19);
  const thursday = new Date(2026, 7, 20);

  test('is false for a one-time ride', () => {
    expect(occursOn({ ...baseRide, rideType: 'one-time' }, wednesday)).toBe(false);
  });

  test('is false when the ride is paused', () => {
    expect(occursOn({ ...baseRide, isPaused: true }, wednesday)).toBe(false);
  });

  test('is false when the ride was cancelled', () => {
    expect(occursOn({ ...baseRide, status: 'Cancelled' }, wednesday)).toBe(false);
  });

  test('is false when the date\'s weekday is not in repeatDays', () => {
    expect(occursOn(baseRide, thursday)).toBe(false);
  });

  test('is true when the date matches a repeat day', () => {
    expect(occursOn(baseRide, wednesday)).toBe(true);
  });

  test('is false when that specific date was skipped', () => {
    const ride = { ...baseRide, skipDates: [dateKey(wednesday)] };
    expect(occursOn(ride, wednesday)).toBe(false);
  });
});

describe('effectiveDeparture', () => {
  test('uses the ride\'s own time when there is no override for that date', () => {
    const ride = { departureTime: new Date(2026, 0, 1, 8, 30), dateOverrides: new Map() };
    const result = effectiveDeparture(ride, new Date(2026, 7, 19));
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7); // still resolves onto the requested date
    expect(result.getDate()).toBe(19);
  });

  test('applies a per-date override time when present', () => {
    const date = new Date(2026, 7, 19);
    const ride = {
      departureTime: new Date(2026, 0, 1, 8, 30),
      dateOverrides: new Map([[dateKey(date), '14:45']])
    };
    const result = effectiveDeparture(ride, date);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(45);
  });
});

describe('validateRideInput', () => {
  const validOneTime = {
    rideType: 'one-time',
    pickupLocation: 'Campus Gate',
    dropoffLocation: 'Railway Station',
    rideDate: '2026-09-01',
    departureTimeStr: '08:30',
    availableSeats: 3,
    pricePerSeat: 40
  };

  const validRecurring = {
    rideType: 'recurring',
    pickupLocation: 'Campus Gate',
    dropoffLocation: 'Railway Station',
    repeatDays: ['Monday', 'Wednesday'],
    departureTimeStr: '08:30',
    availableSeats: 3,
    pricePerSeat: 40
  };

  test('accepts a valid one-time ride', () => {
    expect(validateRideInput(validOneTime)).toBeNull();
  });

  test('accepts a valid recurring ride', () => {
    expect(validateRideInput(validRecurring)).toBeNull();
  });

  test('rejects a pickup location under 2 characters', () => {
    expect(validateRideInput({ ...validOneTime, pickupLocation: 'A' })).toMatch(/pickup/i);
  });

  test('rejects a missing dropoff location', () => {
    expect(validateRideInput({ ...validOneTime, dropoffLocation: '' })).toMatch(/dropoff/i);
  });

  test('rejects a malformed departure time', () => {
    expect(validateRideInput({ ...validOneTime, departureTimeStr: '8:30am' })).toMatch(/departure time/i);
  });

  test('rejects seats outside the 1-4 range', () => {
    expect(validateRideInput({ ...validOneTime, availableSeats: 0 })).toMatch(/seats/i);
    expect(validateRideInput({ ...validOneTime, availableSeats: 5 })).toMatch(/seats/i);
  });

  test('rejects a non-integer seat count', () => {
    expect(validateRideInput({ ...validOneTime, availableSeats: 2.5 })).toMatch(/seats/i);
  });

  test('rejects a negative price', () => {
    expect(validateRideInput({ ...validOneTime, pricePerSeat: -5 })).toMatch(/price/i);
  });

  test('rejects a one-time ride with no date', () => {
    expect(validateRideInput({ ...validOneTime, rideDate: undefined })).toMatch(/ride date/i);
  });

  test('rejects a one-time ride that also sets repeatDays', () => {
    expect(validateRideInput({ ...validOneTime, repeatDays: ['Monday'] })).toMatch(/repeat days/i);
  });

  test('rejects a recurring ride with a rideDate set', () => {
    expect(validateRideInput({ ...validRecurring, rideDate: '2026-09-01' })).toMatch(/ride date/i);
  });

  test('rejects a recurring ride with no weekdays selected', () => {
    expect(validateRideInput({ ...validRecurring, repeatDays: [] })).toMatch(/weekday/i);
  });

  test('rejects a recurring ride with an invalid weekday name', () => {
    expect(validateRideInput({ ...validRecurring, repeatDays: ['Someday'] })).toMatch(/invalid weekday/i);
  });
});
