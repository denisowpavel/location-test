import { Component, inject, OnInit } from '@angular/core';
import { GeoService } from './geo.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css',
})
export class LocationComponent implements OnInit {
  geoService = inject(GeoService);
  ngOnInit() {
    this.geoService.getUserLocation();
  }
}
