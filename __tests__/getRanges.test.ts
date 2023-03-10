import semver from 'semver';
import {
  getAppropriateRange,
  getRanges,
} from '../src/lib/listOutdatedDependencies/getRanges.js';

/**
 *  console.log(semver.satisfies('4.1.0', '^4.0.0')); // true
 *  console.log(semver.satisfies('4.1.0', '4.0.0')); // false
 *  console.log(semver.clean('~4.0.0'), semver.clean('^4.0.0')); // null null
 *  console.log(semver.parse('~4.0.0'), semver.parse('^4.0.0')); // null null
 *  console.log(semver.valid('~4.0.0'), semver.valid('^4.0.0')); // null null
 *  console.log(
 *    semver.coerce('~4.0.0')?.version,
 *    semver.coerce('^4.0.0')?.version,
 *  ); // 4.0.0 4.0.0
 *  console.log(semver.validRange('4.0.0')); // 4.0.0
 *  console.log(semver.validRange('^4.0.0')); // >=4.0.0 <5.0.0-0
 *  console.log(semver.validRange('4.0.0') === '4.0.0'); // true
 *  console.log(
 *    semver.maxSatisfying(
 *      ['4.0.0', '4.1.0', '4.5.0', '5.0.0', '5.9.0'],
 *      semver.validRange('^4.0.0') || '',
 *    ),
 *  ); // 4.5.0
 */

describe('getRanges', () => {
  it('parses exact range', () => {
    expect(getAppropriateRange('3.0.0')).toBe('^3.0.0');
    expect(getAppropriateRange('~3.0.0')).toBe(semver.validRange('~3.0.0'));
  });

  it('has latest in range', () => {
    const result = getRanges(
      {
        name: 'local-dep',
        version: '3.1.3',
      },
      {
        latest: '3.5.0',
        versions: [
          '1.0.0',
          '2.0.0',
          '3.0.0',
          '3.1.3',
          '3.2.0',
          '3.2.3',
          '3.4.0',
          '3.5.0',
        ],
      },
    );
    expect(result.range).toBe('3.5.0');
    expect(result.latest).toBeUndefined();
  });

  it('has latest out of range', () => {
    const result = getRanges(
      {
        name: 'local-dep',
        version: '3.1.3',
      },
      {
        latest: '4.5.0',
        versions: [
          '1.0.0',
          '2.0.0',
          '3.0.0',
          '3.1.3',
          '3.2.0',
          '3.2.3',
          '3.4.0',
          '4.3.0',
          '4.5.0',
        ],
      },
    );

    expect(result.range).toBe('3.4.0');
    expect(result.latest).toBe('4.5.0');
  });

  it('respects version range in package.json', () => {
    const result = getRanges(
      {
        name: 'local-dep',
        version: '~3.1.3',
      },
      {
        latest: '4.5.0',
        versions: [
          '1.0.0',
          '2.0.0',
          '3.0.0',
          '3.1.3',
          '3.1.5',
          '3.1.6',
          '3.2.0',
          '3.2.3',
          '3.4.0',
          '4.3.0',
          '4.5.0',
        ],
      },
    );

    expect(result.range).toBe('3.1.6');
    expect(result.latest).toBe('4.5.0');
  });

  it('doesnt return a range equal to the current version', () => {
    const result = getRanges(
      {
        name: 'local-dep',
        version: '~3.1.3',
      },
      {
        latest: '4.5.0',
        versions: [
          '1.0.0',
          '2.0.0',
          '3.0.0',
          '3.1.3',
          '3.2.0',
          '3.2.3',
          '3.4.0',
          '4.3.0',
          '4.5.0',
        ],
      },
    );

    expect(result.range).toBeUndefined();
    expect(result.latest).toBe('4.5.0');
  });
});
