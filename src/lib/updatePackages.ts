import {exec} from 'child_process';
import {PackageToUpdate} from './types.js';

interface Props {
  packages: PackageToUpdate[];
  rootWorkspace?: string | undefined;
}

export async function installUpdates(props: Props) {
  if (props.packages.length < 1) {
    console.log('No packages chosen, exiting...');
    return;
  }

  const devPackages = props.packages.filter(value => value.dev);
  const packages = props.packages.filter(value => !value.dev);
  if (!props.rootWorkspace) {
    const devInstall = `-D ${devPackages
      .map(item => `${item.name}@${item.to}`)
      .join(' ')}`;
    const install = `${packages
      .map(item => `${item.name}@${item.to}`)
      .join(' ')}`;
    if (devPackages.length > 1) {
      await pnpmInstall(devInstall);
    }
    if (packages.length > 1) {
      await pnpmInstall(install);
    }
  } else {
    let currentWorkspace = '';
    let devInstall = '-D';
    for (const packageToUpdate of devPackages) {
      if (!currentWorkspace) currentWorkspace = packageToUpdate.workspace || '';
      if (currentWorkspace !== packageToUpdate.workspace) {
        // we've switched workspace, run a pnpm i command and set current workspace to the new one
        if (currentWorkspace === props.rootWorkspace) {
          devInstall += ' -w';
        } else {
          devInstall += ` --filter ${currentWorkspace}`;
        }
        // eslint-disable-next-line no-await-in-loop
        await pnpmInstall(devInstall);
        devInstall = '-D';
      }
      devInstall += ` ${packageToUpdate.name}@${packageToUpdate.to}`;
    }
    currentWorkspace = '';
    let install = '';
    for (const packageToUpdate of packages) {
      if (!currentWorkspace) currentWorkspace = packageToUpdate.workspace || '';
      if (currentWorkspace !== packageToUpdate.workspace) {
        // we've switched workspace, run a pnpm i command and set current workspace to the new one
        if (currentWorkspace === props.rootWorkspace) {
          install += ' -w';
        } else {
          install += ` --filter ${currentWorkspace}`;
        }
        // eslint-disable-next-line no-await-in-loop
        await pnpmInstall(install);
        install = '';
      }
      install += ` ${packageToUpdate.name}@${packageToUpdate.to}`;
    }
    console.log('installed all packages');
  }
}

function pnpmInstall(params: string): Promise<string> {
  console.log(`Running 'pnpm i ${params}'`);
  return new Promise((resolve, reject) => {
    exec(`pnpm i ${params}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(new Error(stderr));
      }
      return resolve(stdout);
    });
  });
}
