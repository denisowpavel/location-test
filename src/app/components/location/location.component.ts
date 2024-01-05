import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { GeoService } from './geo.service';
import { IGeolocationCoordinates } from '@interfaces/location';
import { MocTestPoints } from '@components/location/moc-test-points';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationComponent implements OnInit {
  geoService = inject(GeoService);
  testPoints: IGeolocationCoordinates[] = MocTestPoints;

  ngOnInit() {
    this.geoService.getUserLocation();
  }
}
