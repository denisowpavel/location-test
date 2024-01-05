import fs from 'fs';
import { ICity } from '@interfaces/location';
// import * as XLSX from 'xlsx/xlsx.mjs';
import { read, utils } from 'ts-xlsx';
import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';


const xlsBufer = fs.readFileSync('./scripts/data/worldcities.xlsx');
const workbook = read(xlsBufer, { type: 'buffer' });
const ws = workbook.Sheets[workbook.SheetNames[0]];
const list = utils.sheet_to_json(ws);
setCities(list).then();

async function setCities(cities: any[]) {
  cities.forEach((cityRow) => {
    const city = {
      id: `${cityRow.id}`,
      name: cityRow.city,
      name_en: cityRow.city_ascii,
      location: { _lat: cityRow.lat, _long: cityRow.lng },
      country: cityRow.country,
      iso2: cityRow.iso2,
      iso3: cityRow.iso3,
      admin_name: cityRow.admin_name || null,
      capital: cityRow.capital || null,
      population: cityRow.population || 0,
    } as ICity;
    console.log(city);
    // TODO: load local name from http://www.geonames.org/
  });
  console.log('Added', cities.length);
  const json = JSON.stringify(cities);
  fs.writeFile('cities.json', json, 'utf8', console.log);
}

//https://www.geonames.org/countries/RU/Russia.html
