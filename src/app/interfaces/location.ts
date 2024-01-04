export interface IGeoPoint {
  _lat: number;
  _long: number;
}

export interface ILocation {
  country: string;
  region?: string;
  city: string;
  area?: string;
  latitude: number;
  longitude: number;
}

export interface ICity {
  name: string;
  name_en: string;
  location: IGeoPoint;
  country: string;
  iso2: string;
  iso3:  string;
  admin_name: string;
  capital: string;
  population: number;
  id: string;
}
