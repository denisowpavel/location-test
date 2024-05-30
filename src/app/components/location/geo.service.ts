import { inject, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICity, IGeolocationCoordinates } from '@interfaces/location';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  private http = inject(HttpClient);
  list = toSignal<ICity[]>(this.loadRegionData('RU'));

  public loadRegionData(regionKey: string): Observable<ICity[]> {
    // todo USE protobuf
    return this.http.get<ICity[]>(`assets/${regionKey}-test.json`);
  }

  public getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('>>>', position.coords);
      });
    } else {
      console.log('User not allow');
    }
  }

  public getCity(point: IGeolocationCoordinates): ICity | undefined {
    //console.log(point);
    if (this.list()?.length) {
      return this.list()?.find((element) => {
        return this.onArea(element, point);
      });
    } else {
      return undefined;
    }
  }

  public onArea(city: ICity, point: IGeolocationCoordinates): boolean {
    const area = 0.15;
    city.location = {
      latitude: parseFloat(city.lat),
      longitude: parseFloat(city.lng),
    };
    return (
      city.location.latitude > point.latitude - area &&
      city.location.latitude < point.latitude + area &&
      city.location.longitude > point.longitude - area &&
      city.location.longitude < point.longitude + area
    );
  }
}
// https://www.youtube.com/watch?v=jxOAU7YfypA
// https://www.youtube.com/watch?v=0rvjI_EBvXs
// https://www.youtube.com/watch?v=PkdtAZdgI6k
//https://github.com/mapbox/delaunator
//https://www.youtube.com/watch?v=oQXWiL0bbhc
//https://www.youtube.com/watch?v=pUwEp1hs8MM
//www.kobzarev.com/programming/calculation-of-distances-between-cities-on-their-coordinates/
//https://www.youtube.com/watch?v=GctAunEuHt4
//https://www.youtube.com/watch?v=KcyGmhWcmqc
