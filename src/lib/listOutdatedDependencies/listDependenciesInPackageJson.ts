import {readFile} from 'fs/promises';
import {Dependency, Project} from '../types.js';

export async function listDependenciesInPackageJson(project: Project) {
  const packageJson = JSON.parse(
    (await readFile(`${project.path}/package.json`)).toString(),
  );
  const dependencies: Dependency[] = [];
  const devDependencies: Dependency[] = [];
  if (packageJson.dependencies) {
    for (const [key, value] of Object.entries(packageJson.dependencies)) {
      if (typeof value !== 'string') {
        throw new Error(
          `Expected ${
            project.name
          }.dependencies.${key} to be of type string, but found ${typeof value}`,
        );
      }
      dependencies.push({
        name: key,
        version: value,
      });
    }
  }
  if (packageJson.devDependencies) {
    for (const [key, value] of Object.entries(packageJson.devDependencies)) {
      if (typeof value !== 'string') {
        throw new Error(
          `Expected ${
            project.name
          }.devDependencies.${key} to be of type string, but found ${typeof value}`,
        );
      }
      devDependencies.push({
        name: key,
        version: value,
      });
    }
  }
  return {
    dependencies,
    devDependencies,
  };
}
