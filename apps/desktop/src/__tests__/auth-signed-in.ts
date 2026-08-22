export type MeResponse = {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  permissions: string[];
  primaryRole: string;
};

export const signedInOwner: MeResponse = {
  sub: "auth0|owner",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
  permissions: [],
  primaryRole: "owner",
};
