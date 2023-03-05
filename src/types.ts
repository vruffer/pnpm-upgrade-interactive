export interface Version {
  name: string;
  current: string;
  range: string;
  latest?: string | undefined;
  chosen: string;
}
