import {fetch} from 'undici';
import {RemoteDependency} from '../types.js';

import {isObject, npmEndpoint} from '../utils.js';

export async function fetchNpmPackage(
  packageName: string,
): Promise<RemoteDependency> {
  const endpoint = `${npmEndpoint}${packageName}`;
  console.log(`fetching package: ${endpoint}`);
  const res = await fetch(endpoint);
  const data = await res.json();
  return validateNpmPackage(data);
}

function validateNpmPackage(obj: unknown) {
  if (!isObject(obj)) {
    throw new Error(`Expected fetchPackage response to be of type object`);
  }
  const {'dist-tags': distTags, versions, time} = obj;
  if (!isObject(distTags)) {
    throw new Error(`Expected fetchPackage.dist-tags to be of type object`);
  }
  if (!isObject(versions)) {
    throw new Error(`Expected fetchPackage.versions to be of type object`);
  }
  if (!isObject(time)) {
    throw new Error(`Expected fetchPackage.time to be of type object`);
  }

  const {latest} = distTags;
  if (typeof latest !== 'string') {
    throw new Error(
      `Expected fetchPackage.dist-tags.latest to be of type string`,
    );
  }

  return {
    latest,
    versions: Object.keys(versions),
  };
}
