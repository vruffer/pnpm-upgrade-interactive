import {exec} from 'child_process';
import {OutdatedVersion} from '../types.js';

export function listOutdatedPackages(): Promise<OutdatedVersion[]> {
  return new Promise((resolve, reject) => {
    exec('pnpm outdated -r --json', (_error, stdout, stderr) => {
      // outdated populates error no matter what, dunno why
      if (stderr) {
        console.log('stderr was a thing');
        return reject(new Error(`stderr: ${stderr}`));
      }
      const parsed = JSON.parse(stdout);
      if (typeof parsed !== 'object' || parsed === null) {
        return reject(new Error('Listed dependencies is not an object'));
      }

      let outdatedPackages: Array<OutdatedVersion> = [];
      let aWorkspace: string;
      for (const [name, outdated] of Object.entries(parsed)) {
        if (typeof outdated !== 'object' || outdated === null) {
          return reject(new Error('package is not an object'));
        }
        const {current, latest, wanted, dependentPackages} = outdated as Record<
          string,
          unknown
        >;
        if (typeof current !== 'string') {
          return reject(
            new Error(`Dependency ${name}.current is not a string`),
          );
        }
        if (typeof latest !== 'string') {
          return reject(new Error(`Dependency ${name}.latest is not a string`));
        }
        if (typeof wanted !== 'string') {
          return reject(new Error(`Dependency ${name}.wanted is not a string`));
        }
        if (!Array.isArray(dependentPackages)) {
          return reject(
            new Error(`Dependency ${name}.dependentPackage is not an array`),
          );
        }
        if (dependentPackages.length !== 1) {
          console.warn(
            `${name} has more than 1 dependentPackage`,
            dependentPackages,
          );
        }
        const workspace = dependentPackages[0];
        if (typeof workspace !== 'object') {
          return reject(
            new Error(
              `Dependency ${name}.dependentPackage[0] is not an object`,
            ),
          );
        }
        const {name: workspaceName} = workspace;
        if (typeof workspaceName !== 'string') {
          return reject(
            new Error(
              `Dependency ${name}.dependentPackage[0].name is not a string`,
            ),
          );
        }

        const outdatedVersion: OutdatedVersion = {
          current,
          name,
        };
        if (wanted !== current) {
          outdatedVersion.range = wanted;
        }
        if (latest !== current && latest !== wanted) {
          outdatedVersion.latest = latest;
        }
        if (workspaceName) {
          outdatedVersion.workspace = workspaceName;
        }
        outdatedPackages.push(outdatedVersion);
        aWorkspace = workspaceName;
      }

      if (outdatedPackages.every(value => value.workspace === aWorkspace)) {
        // all packages are in root workspace
        outdatedPackages = outdatedPackages.map(value => ({
          ...value,
          workspace: undefined,
        }));
      }
      return resolve(outdatedPackages);
    });
  });
}
