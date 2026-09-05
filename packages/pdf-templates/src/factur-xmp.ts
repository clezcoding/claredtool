import type { XmpSchema } from "takumi-pdf";

const FX_NAMESPACE =
  "urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#";

/**
 * Factur-X PDF/A extension XMP (D-07, D-08, D-09).
 * ConformanceLevel is hardcoded "EN 16931" — never profile.toUpperCase() (Pitfall 1).
 * Version locked to "1.0" (A4 RESOLVED; Mustang confirm in 04.7-06).
 */
export function facturXmp(): XmpSchema {
  return {
    name: "Factur-X PDF/A Extension",
    prefix: "fx",
    namespace: FX_NAMESPACE,
    properties: [
      {
        name: "DocumentType",
        value: "INVOICE",
        description: "the type of document the XML describes",
      },
      {
        name: "DocumentFileName",
        value: "factur-x.xml",
        description: "name of the embedded XML invoice file",
      },
      {
        name: "Version",
        value: "1.0",
        description: "the version of the Factur-X standard",
      },
      {
        name: "ConformanceLevel",
        value: "EN 16931",
        description: "the profile the XML conforms to",
      },
    ],
  };
}
