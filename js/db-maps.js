import { $, $$ } from './utils.js';

const makeMaps = async (data) => {
    //const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    const dbMapDiv = document.createElement('div');
    dbMapDiv.classList.add('db-map');

    const mapDiv = document.createElement('div');
    mapDiv.classList.add('map');

    const listDiv = document.createElement('div');
    listDiv.classList.add('list');

    dbMapDiv.append(mapDiv);
    dbMapDiv.append(listDiv);

    $('#db-maps').append(dbMapDiv);

    const world = "data/world.json";
    const worldResponse = await fetch(world);
    const worldJson = await worldResponse.json();
    const worldOpts = { 
        style: (feature) => {
            return {
                fillColor: 'lightgreen',
                weight: 1,
                opacity: 1,
                color: 'green',
                fillOpacity: 0.35
            };
        }
    };

    const map = L.map(mapDiv).setView([0, 0], 2);
    
    L.geoJSON(worldJson, worldOpts).addTo(map);

    // https://github.com/mihai-craita/countries_center_box/blob/master/countries.json
    const countries = "data/countries.json";
    const countriesResponse = await fetch(countries);
    const countriesJson = await countriesResponse.json();
    data.filter(d => d.country).forEach(loc => {
        const country = countriesJson
            .filter(c => c.long_name === loc.country)[0];

        if (country) {
            const lat = Number(country.center_lat);
            const lng = Number(country.center_lng);
            const centroid = [ lat, lng ];
            const radius = Number(loc.num) * 10;

            const circle = L.circle(centroid, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.35,
                weight: 1,
                radius
            }).addTo(map);
        }
    });

    const list = data
        .sort()
        .slice(0, 10)
        .map(el => `<li>${el.country || 'no location'}: ${el.num}</li>`);

    listDiv.innerHTML = `<ul>${list.join('')}</ul>`;
}

export { makeMaps }