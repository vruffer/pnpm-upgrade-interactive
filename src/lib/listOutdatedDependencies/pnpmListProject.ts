import {exec} from 'child_process';
import {Project} from '../types.js';
import { isObject } from '../utils.js';

const tag = 'pnpmListProjects';

export function pnpmListProjects(): Promise<Project[]> {
  return new Promise((resolve, reject) => {
    exec('pnpm list --json --depth -1 -r', (error, stdout, stderr) => {
      if (error) {
        console.log(tag, 'error was a thing');
        return reject(error);
      }
      if (stderr) {
        console.log(tag, 'stderr was a thing');
        return reject(new Error(`stderr: ${stderr}`));
      }
      // if the folder you're in contains more than one project (which aren't part of the same workspace, like an example folder) pnpm picks them up anyway
      // this means the output contains more than 1 root array, which is invalid json.
      // currently this only takes the first root array, meaning the first package.json found
      const workspaceStrings = stdout.split(/(?=>(\]\n))|(?<=(\]\n))/g);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const projects = JSON.parse(workspaceStrings[0]!);
      if (!Array.isArray(projects)) {
        return reject(new Error('projects is not an array'));
      }

      return resolve(parseProjects(projects));
    });
  });
}

function parseProjects(arr: unknown[]): Project[] {
  const projects: Project[] = [];
  for (const project of arr) {
    if (!isObject(project)) {
      throw new Error('Expected project to be of type object');
    }
    const {name, path} = project;
    if (typeof name !== 'string') {
      throw new Error('Expected project.name to be of type string');
    }
    if (typeof path !== 'string') {
      throw new Error(`${tag}: expected project.path to be of type string`);
    }

    projects.push({
      name,
      path,
    });
  }

  return projects;
}
