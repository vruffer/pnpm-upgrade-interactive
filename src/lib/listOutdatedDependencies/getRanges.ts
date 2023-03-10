import {coerce, maxSatisfying, satisfies, validRange} from 'semver';
import {Dependency, OutdatedVersion, RemoteDependency} from '../types.js';

export function getRanges(
  localDep: Dependency,
  remoteDep: RemoteDependency,
): OutdatedVersion {
  const version: OutdatedVersion = {
    current: localDep.version,
    name: localDep.name,
    dev: false,
  };
  const appropriateRange = getAppropriateRange(localDep.version);

  if (satisfies(remoteDep.latest, appropriateRange)) {
    version.range = remoteDep.latest;
    return version;
  }
  version.latest = remoteDep.latest;
  const satisfyingRange = maxSatisfying(remoteDep.versions, appropriateRange);
  if (satisfyingRange && satisfyingRange !== coerce(localDep.version)?.version) {
    version.range = satisfyingRange;
  }
  return version;
}

export function getAppropriateRange(range: string) {
  // validRange returns the input string if the range is exact, i.e. '4.0.0'
  const parsed = validRange(range);
  if (parsed === null) {
    throw new Error('Invalid range');
  }
  if (parsed === range) {
    return `^${parsed}`;
  }
  return parsed;
}
