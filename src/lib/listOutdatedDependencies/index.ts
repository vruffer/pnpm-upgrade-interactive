import semver from 'semver';
import {fetchNpmPackage} from '../npm/fetchPackage.js';
import {OutdatedVersion} from '../types.js';
import {getRanges} from './getRanges.js';
import {listDependenciesInPackageJson} from './listDependenciesInPackageJson.js';
import {pnpmListProjects} from './pnpmListProject.js';

const tag = 'listOutdatedDependencies';

export async function listOutdatedDependencies() {
  const projects = await pnpmListProjects();
  let outdatedDependencies: OutdatedVersion[] = [];
  for (const project of projects) {
    /* eslint-disable no-await-in-loop */
    const {dependencies, devDependencies} = await listDependenciesInPackageJson(
      project,
    );

    const dependencyPromises = dependencies.map(async dependency => {
      const dependencyInfo = await fetchNpmPackage(dependency.name);
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

    const devDependencyPromises = devDependencies.map(async dependency => {
      const dependencyInfo = await fetchNpmPackage(dependency.name);
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
      // @ts-expect-error filter(Boolean) removes all undefined values
      (await Promise.all(dependencyPromises)).filter(Boolean),
    );

    outdatedDependencies = outdatedDependencies.concat(
      // @ts-expect-error filter(Boolean) removes all undefined values
      (await Promise.all(devDependencyPromises)).filter(Boolean),
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
  return outdatedDependencies;
}
