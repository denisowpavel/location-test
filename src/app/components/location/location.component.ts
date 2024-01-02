import { Component } from '@angular/core';
import {GeoService} from "./geo.service";

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})

export class LocationComponent {
  constructor(private geoService: GeoService) {
    this.geoService.getUserLocation();
  }

}
