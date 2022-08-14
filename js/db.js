import { makeTiles, updateTiles } from './db-tiles.js';
import { makeCharts, updateCharts } from './db-charts.js';
import { makeMaps, updateMaps } from './db-maps.js';

const initDashboard = (stats) => {
    makeTiles(stats);
    makeCharts(stats);
    makeMaps(stats.locations);
}

const updateDashboard = (stats) => {
    updateTiles(stats);
    updateCharts(stats);
    updateMaps(stats.locations);
}

export { initDashboard, updateDashboard }