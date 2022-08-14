import { $, $$ } from './utils.js';

/**
 * Update the displayed year on change in range input.
 * Also update all the tiles with the corresponding 
 * value for the new year
**/
 const updateYear = (stats) => {
    const year = Number($('#years').value);
    $('#yearsVal').innerText = year;
    updateTiles(stats);
}

const makeTile = (stats, entity) => {
    const year = Number($('#years').value);
    const i = stats.categories.indexOf(year);

    if (Array.isArray(stats.values[entity])) {
        const total = stats.values[entity][i];

        const dbTileDiv = makeElement(
            'div', 
            { 
                id: `tile-${entity}`,
                class: 'tile' 
            },
            `${entity}: ${total}`
        );

        $('#db-tiles').append(dbTileDiv);
    }
}

const updateTile = (stats, entity) => {
    const year = Number($('#years').value);
    const i = stats.categories.indexOf(year);
    const total = stats.values[entity][i] || '';
    $(`#tile-${entity}`).innerHTML = `${entity}: ${total}`;
}

const makeElement = (name, opts, html) => {
    const el = document.createElement(name);

    if (opts) {
        for (let [k, v] of Object.entries(opts)) {
            el.setAttribute(k, v);
        }
    }

    if (html) {
        el.innerHTML = html;
    }

    return el;
}

const makeController = () => {
    const dbControllerDiv = makeElement(
        'div', 
        { 
            id: 'controller',
            class: 'tabs'
        }
    )

    const dbYearInput = makeElement(
        'input',
        {
            id: 'years',
            name: 'years',
            type: 'range',
            step: 1,
        }
    );

    dbControllerDiv.append(dbYearInput);

    const dbYearBr = makeElement('br');
    dbControllerDiv.append(dbYearBr);

    const dbYearLabel = makeElement(
        'label', 
        { for: 'years' },
        'Year <span id="yearsVal"></span>'
    );

    dbControllerDiv.append(dbYearLabel);
    
    $('#db-tiles').append(dbControllerDiv);

    const dbTilesDiv = makeElement('div', { id: 'tiles' });
    $('#db-tiles').append(dbTilesDiv);
}

/**
 * initialize the range input dingus
**/
const updateRangeInput = (stats) => {
    $('#years').min = Math.min(...stats.categories);
    $('#years').max = Math.max(...stats.categories);
    $('#years').value = stats.categories[0];
    $('#yearsVal').innerText = stats.categories[0];
}

const makeTiles = (stats) => {
    makeController();
    $('#years').addEventListener('input', (e) => updateYear(stats));
    updateRangeInput(stats);

    Object.keys(stats.values)
        .forEach(entity => makeTile(stats, entity));
}

const updateTiles = (stats) => {
    //updateRangeInput(stats);
    //console.log(stats.values)
    Object.keys(stats.values)
        .forEach(entity => updateTile(stats, entity));
}


export { updateYear, makeTiles, updateTiles }