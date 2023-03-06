export interface Version {
  name: string;
  current: string;
  range?: string | undefined;
  latest?: string | undefined;
  chosen: string;
  workspace?: string | undefined;
}

export interface OutdatedVersion {
  name: string;
  current: string;
  range?: string | undefined;
  latest?: string | undefined;
  workspace?: string | undefined;
}
