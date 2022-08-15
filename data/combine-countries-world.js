const fs = require('fs');

const world = JSON.parse(fs.readFileSync('./world.json', 'utf8'));
const countries = JSON.parse(fs.readFileSync('./countries.json', 'utf8'));

/*
 * the following are not in countries
 *
    United Arab Emirates
    Antarctica
    French Southern and Antarctic Lands
    Bosnia and Herzegovina
    Central African Republic
    Ivory Coast
    Democratic Republic of the Congo
    Republic of the Congo
    Northern Cyprus
    Dominican Republic
    Falkland Islands
    England
    Guinea Bissau
    Equatorial Guinea
    Greenland
    Macedonia
    Myanmar
    New Caledonia
    Puerto Rico
    Western Sahara
    Somaliland
    Republic of Serbia
    East Timor
    Trinidad and Tobago
    United Republic of Tanzania
    West Bank
 */


world.features.forEach(f => {
    const p = f.properties;
    const n = p.name;
    const c = countries.filter(c => c.long_name === n)[0];
    // if (n === 'Zambia') {
    //     console.log(typeof(c));
    //     delete c.long_name;
    //     console.log(c)
    // }

    if (typeof(c) === 'object') {
        delete c.long_name;

        for (let [k, v] of Object.entries(c)) {
            p[k] = v;
        }
    }
});

fs.writeFileSync('./world-countries.json', JSON.stringify(world), 'utf8');