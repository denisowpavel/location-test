import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  ViewChild,
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
export class LocationComponent implements AfterViewInit {
  geoService = inject(GeoService);
  testPoints: IGeolocationCoordinates[] = MocTestPoints;

  @ViewChild('diagramCanvas') canvas: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D;
  private metrics = 3; //1-Евклидова, 2-Манхэттенская, 3-Минковского
  private numPoints = 0;
  private X = new Array();
  private Y = new Array();
  private C = new Array();

  ngAfterViewInit() {
    // this.geoService.getUserLocation();
    this.ctx = this.canvas.nativeElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D;

    // setTimeout(()=>{
    console.log('>', this.ctx);
    // },1000)
  }

  private randomNumber(max: number): number {
    //Случайное число [0;max-1]
    return Math.floor(Math.random() * max);
  }

  private randomColor() {
    //Случайный цвет с интенсивностью компонент не ниже 33hex
    return (
      '#' +
      ('00' + (51 + this.randomNumber(205)).toString(16)).slice(-2) +
      ('00' + (51 + this.randomNumber(205)).toString(16)).slice(-2) +
      ('00' + (51 + this.randomNumber(205)).toString(16)).slice(-2)
    );
  }

  private Metric(x: number, y: number): number {
    //Выбор метрики
    if (this.metrics == 1) {
      return Math.sqrt(x * x + y * y);
    }
    if (this.metrics == 2) {
      return Math.abs(x) + Math.abs(y);
    }
    if (this.metrics == 3) {
      return Math.pow(
        Math.pow(Math.abs(x), 3) + Math.pow(Math.abs(y), 3),
        0.33333
      );
    }
    return -1;
  }

  private Diagram() {
    if (!this.ctx) {
      return;
    }
    //Диаграмма
    let width = this.canvas.nativeElement.width;
    let height = this.canvas.nativeElement.height;
    let dist1 = 0;
    let dist0 = 0;
    let j = 0;
    let width1 = width - 2;
    let height1 = height - 2;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, width, height);
    for (var y = 0; y < height1; y++) {
      for (var x = 0; x < width1; x++) {
        dist0 = this.Metric(height1, 1);
        j = -1;
        for (var i = 0; i < this.numPoints; i++) {
          let dist1 = this.Metric(this.X[i] - x, this.Y[i] - y);
          if (dist1 < dist0) {
            dist0 = dist1;
            j = i;
          }
        }
        this.ctx.fillStyle = this.C[j];
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
    this.ctx.fillStyle = 'black';
    for (var i = 0; i < this.numPoints; i++) {
      this.ctx.fillRect(this.X[i], this.Y[i], 3, 3);
    }
  }

  public addPoint(e: PointerEvent | MouseEvent): void {
    if (!this.ctx) {
      return;
    }
    const x = e.clientX - this.canvas.nativeElement.offsetLeft;
    const y = e.clientY - this.canvas.nativeElement.offsetTop;
    for (var i = 0; i < this.X.length; i++) {
      if (
        Math.sqrt(Math.pow(this.X[i] - x, 2) + Math.pow(this.Y[i] - y, 2)) < 5
      ) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.X[i] - 2, this.Y[i] - 2, 7, 7);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.X[i], this.Y[i], 3, 3);
        return; //Подчеркнём, что "слишком близко" и не добавляем
      }
    }
    this.X[this.numPoints] = x;
    this.Y[this.numPoints] = y;
    this.C[this.numPoints] = this.randomColor();
    this.numPoints++;
    this.Diagram();
  }
}


//http://www.raymondhill.net/voronoi/rhill-voronoi-demo5.html
// https://habr.com/ru/articles/309252/
