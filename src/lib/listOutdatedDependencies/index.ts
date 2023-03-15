import semver from 'semver';
import {fetchNpmPackage} from '../npm/fetchPackage.js';
import {OutdatedVersion, RemoteDependency} from '../types.js';
import {isDefined} from '../utils.js';
import {getRanges} from './getRanges.js';
import {listDependenciesInPackageJson} from './listDependenciesInPackageJson.js';
import {pnpmListProjects} from './pnpmListProject.js';

const tag = 'listOutdatedDependencies';

export async function listOutdatedDependencies() {
  const projects = await pnpmListProjects();
  let outdatedDependencies: OutdatedVersion[] = [];
  let rootProject: string | undefined;
  const fetchedPackages: Record<string, RemoteDependency> = {};
  for (const project of projects) {
    /* eslint-disable no-await-in-loop */
    const {dependencies, devDependencies} = await listDependenciesInPackageJson(
      project,
    );

    if (!rootProject || project.name.length < rootProject.length) {
      rootProject = project.name;
    }

    const dependencyPromises = dependencies.map(async dependency => {
      if (!fetchedPackages[dependency.name]) {
        fetchedPackages[dependency.name] = await fetchNpmPackage(
          dependency.name,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dependencyInfo = fetchedPackages[dependency.name]!;
      const cleanLocal = semver.coerce(dependency.version);
      if (cleanLocal === null) {
        throw new Error(
          `Could not get semver of local dependency ${dependency.name}, with version: ${dependency.version}`,
        );
      }
      if (semver.eq(dependencyInfo.latest, cleanLocal.version)) {
        console.log(tag, `${dependency.name} is already the latest version`);
        return undefined;
      }

      const outdatedVersion = getRanges(dependency, dependencyInfo);
      outdatedVersion.workspace = project.name;
      outdatedVersion.dev = false;
      return outdatedVersion;
    });

    outdatedDependencies = outdatedDependencies.concat(
      (await Promise.all(dependencyPromises)).filter(isDefined),
    );

    const devDependencyPromises = devDependencies.map(async dependency => {
      if (!fetchedPackages[dependency.name]) {
        fetchedPackages[dependency.name] = await fetchNpmPackage(
          dependency.name,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dependencyInfo = fetchedPackages[dependency.name]!;
      const cleanLocal = semver.coerce(dependency.version);
      if (cleanLocal === null) {
        throw new Error(
          `Could not get semver of local dependency ${dependency.name}, with version: ${dependency.version}`,
        );
      }
      if (semver.eq(dependencyInfo.latest, cleanLocal.version)) {
        console.log(`${dependency.name} is already the latest version`);
        return undefined;
      }
      const outdatedVersion = getRanges(dependency, dependencyInfo);
      outdatedVersion.workspace = project.name;
      outdatedVersion.dev = true;
      return outdatedVersion;
    });

    outdatedDependencies = outdatedDependencies.concat(
      (await Promise.all(devDependencyPromises)).filter(isDefined),
    );

    /* eslint-enable no-await-in-loop */
  }
  if (projects.length === 1) {
    // only one workspace (root), remove all workspace entries from outdated dependencies
    return outdatedDependencies.map(dependency => ({
      ...dependency,
      workspace: undefined,
    }));
  }
  if (!rootProject) {
    throw new Error(`Expected to find a rootProjectName`);
  }
  return {outdatedDependencies, rootProject};
}
