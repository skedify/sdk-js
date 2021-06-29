declare module "skedify-sdk" {
  export interface ListingLocation {
    city: string;
    country: string;
    geolocation: string;
    latitude: number;
    longitude: number;
    postalCode: string;
    state?: string | null;
    street1: string;
    street2?: string | null;
  }
  export interface Listing {
    active: boolean;
    activeVersion: boolean;
    createdAt: string;
    createdById: number;
    createdByType: "user";
    deletedAt: string;
    description?: string | null;
    externalId?: string | null;
    id: string;
    listingId: number;
    location?: ListingLocation | null;
    title: string;
    updatedAt: string;
    version: string;
  }
}
