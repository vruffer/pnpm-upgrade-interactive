export interface Version {
  name: string;
  current: string;
  range?: string | undefined;
  latest?: string | undefined;
  chosen: string;
  workspace?: string | undefined;
  dev: boolean;
}

export interface OutdatedVersion {
  name: string;
  current: string;
  range?: string | undefined;
  latest?: string | undefined;
  workspace?: string | undefined;
  dev: boolean;
}

export interface Project {
  name: string;
  path: string;
}

export interface Dependency {
  name: string;
  version: string;
}

export interface RemoteDependency {
  latest: string;
  versions: string[];
}

export interface PackageToUpdate {
  name: string;
  from: string;
  to: string;
  workspace?: string | undefined;
  dev: boolean;
}
