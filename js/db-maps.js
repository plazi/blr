import { $, $$ } from './utils.js';

const markers = L.layerGroup();
let map;
let countriesJson;

const makeMaps = async (locations) => {
    //const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    const dbMapDiv = document.createElement('div');
    dbMapDiv.classList.add('db-map');

    const mapDiv = document.createElement('div');
    mapDiv.classList.add('map');

    const listDiv = document.createElement('div');
    listDiv.setAttribute('id', 'location-list');
    listDiv.classList.add('list');

    dbMapDiv.append(mapDiv);
    dbMapDiv.append(listDiv);

    $('#db-maps').append(dbMapDiv);

    const world = "data/world.json";
    const worldResponse = await fetch(world);
    const worldJson = await worldResponse.json();

    // https://github.com/mihai-craita/countries_center_box/blob/master/countries.json
    const countries = "data/countries.json";
    const countriesResponse = await fetch(countries);
    countriesJson = await countriesResponse.json();

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

    map = L.map(mapDiv).setView([0, 0], 2);
    L.geoJSON(worldJson, worldOpts).addTo(map);
    addLocations(locations, listDiv);
}

const updateMaps = (locations) => {
    markers.clearLayers();
    addLocations(locations, $('#location-list'));
}

const addLocations = async (locations, target) => {
    const locs = locations.filter(d => d.country);

    for (let i = 0, j = locs.length; i < j; i++) {
        const loc = locs[i];
        const country = countriesJson
            .filter(c => c.long_name === loc.country)[0];

        if (country) {
            const lat = Number(country.center_lat);
            const lng = Number(country.center_lng);
            const centroid = [ lat, lng ];
            const num = Number(loc.num);
            const radius = num * 10;

            const circle = L.circle(centroid, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.35,
                weight: 1,
                radius
            }).bindPopup(`<p class="loc-num">${loc.country}: ${num}</p>`);

            markers.addLayer(circle);
        }
    }

    map.addLayer(markers);

    const list = locations
        .sort()
        .filter(el => el.country)
        .slice(0, 10)
        .map(el => `<li>${el.country}: ${el.num}</li>`);

    target.innerHTML = `<ul><li><b>Top Ten</b></li>${list.join('')}</ul>`;
}

export { makeMaps, updateMaps }