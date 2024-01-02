import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor() { }
  public getUserLocation() {
       if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          console.log(position.coords)
          });
    }else {
       console.log("User not allow")

    }
  }
}
