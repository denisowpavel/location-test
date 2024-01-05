import fs from 'fs/promises';
import { ICity, IGeolocationCoordinates } from '@interfaces/location';

const POINT: IGeolocationCoordinates = {
  accuracy: 12328.05360532256,
  latitude: 56.4745766,
  longitude: 85.0552022,
};

console.log('==COMPUTED-GEODATA==');
fs.readFile('./' + 'scripts/data/cities.json', 'utf8').then((data) => {
  const soutce = JSON.parse(data) as ICity[];
  //Split by countries
  const map = new Map();
  soutce.forEach((c) => {
    if (!map.get(c.iso2)) {
      map.set(c.iso2, true);
    }
  });
  map.forEach((v, key) => {
    map.set(
      key,
      soutce.filter((c) => c.iso2 === key)
    );
  });
  console.log(map.get('RU'));
  fs.writeFile('RU-test.json', JSON.stringify(map.get('RU')));
  // console.log(
  //   (map.get('RU') as ICity[]).find((element) => {
  //     return onArea(element, POINT);
  //   })
  // );
});

// function nearestCity(citys: ICity[], point: IGeolocationCoordinates, ): ICity {
//   console.log(citys[0])
// }

function onArea(city: ICity, point: IGeolocationCoordinates): boolean {
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
