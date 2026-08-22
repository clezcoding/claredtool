export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  permissions: string[];
  primaryRole: string;
  iat?: number;
  hostname?: string;
};
