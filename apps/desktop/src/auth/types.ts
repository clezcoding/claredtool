export type MeResponse = {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  permissions: string[];
  primaryRole: string;
};
