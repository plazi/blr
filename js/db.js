import { makeTiles } from './db-tiles.js';
import { makeCharts } from './db-charts.js';
import { makeMaps } from './db-maps.js';

const init = async () => {
    const url = "data/data.json";
    const response = await fetch(url);
    const data = await response.json();
    
    makeTiles(data);
    makeCharts(data);
    makeMaps(data.locations);
}

export { init }