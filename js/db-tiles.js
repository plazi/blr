import { $, $$ } from './utils.js';

/**
 * Update the displayed year on change in range input.
 * Also update all the tiles with the corresponding 
 * value for the new year
**/
 const updateYears = (data) => {
    const year = Number($('#years').value);
    $('#yearsVal').innerText = year;
    updateTiles(data);
}

const updateTiles = (data) => {
    let str = '';
    Object.keys(data.values)
        .forEach(entity => str += updateTile(data, entity));

    $('#tiles').innerHTML = str;
}

const updateTile = (data, entity) => {
    const year = Number($('#years').value);
    const i = data.categories.indexOf(year);
    let str = `<div>`;
    let total = 0;

    if (Array.isArray(data.values[entity])) {
        total = data.values[entity][i];
        str += `<div class="title">${entity}: ${total}</div>`;
    }
    else {
        let substr = '';

        for (let [k, v] of Object.entries(data.values[entity])) {
            total += v[i];
            substr += `<div class="subtotal">${k}: ${v[i]}</div>`
        }

        str += `<div class="title">${entity}: ${total}</div>`;
        str += substr;
    }

    str += `</div>`;
    return str;  
}

const makeElement = (name, opts, html) => {
    const el = document.createElement(name);

    for (let [k, v] of Object.entries(opts)) {
        el.setAttribute(k, v);
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

    const dbYearBr = makeElement('br', {});
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
const initRangeInput = (data) => {
    $('#years').min = Math.min(...data.categories);
    $('#years').max = Math.max(...data.categories);
    $('#years').value = data.categories[0];
    $('#yearsVal').innerText = data.categories[0];
}

const makeTiles = (data) => {
    makeController();
    $('#years').addEventListener('input', (e) => updateYears(data));
    initRangeInput(data);
    updateTiles(data);
}

export { updateYears, makeTiles }