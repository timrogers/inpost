export enum LockerSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationAvailability {
  availabilityByLockerSize: {
    [key in LockerSize]: {
      totalCount: number;
      availableCount: number;
    };
  };
  lastUpdatedAt: Date;
}
