export interface IGeolocationCoordinates {
  accuracy?: number;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface IGeoPoint {
  latitude: number;
  longitude: number;
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
  city: string;
  name: string;
  name_en: string;
  location: IGeoPoint;
  country: string;
  iso2: string;
  iso3: string;
  admin_name: string;
  capital: string;
  population: number;
  id: string;

  lat: string,
  lng: string,

}
