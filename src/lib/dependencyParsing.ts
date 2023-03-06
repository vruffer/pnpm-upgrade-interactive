import {listOutdatedPackages} from './listPackages.js';

export async function dependencies() {
  const outdatedPackages = await listOutdatedPackages();

  return outdatedPackages;
}
