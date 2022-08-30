import { estimateDFMC } from '../index';

describe('sum module', () => {
    test('Estimation with parameters must be equal to a especific value', () => {
        expect(estimateDFMC("15:00", 2, "12:00", 21, 12, "Exposed", 13, "W")).toBe(4);
    });
});

