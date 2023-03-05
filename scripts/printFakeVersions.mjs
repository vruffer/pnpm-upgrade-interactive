import {faker} from '@faker-js/faker';

export function createFakeVersion() {
  return {
    name: faker.hacker.verb(),
    current: faker.system.semver(),
    range: faker.system.semver(),
    latest: faker.helpers.maybe(() => faker.system.semver(), {
      probability: 0.5,
    }),
  };
}

console.log([
  createFakeVersion(),
  createFakeVersion(),
  createFakeVersion(),
  createFakeVersion(),
]);
