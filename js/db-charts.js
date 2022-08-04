import { $, $$ } from './utils.js';

const values2columns = (data, entity) => {
    const values = data.values[entity];

    //for (let [k, v] of Object.entries(values)) {
        if (Array.isArray(values)) {
            return { 
                label: entity, 
                data: values,
                backgroundColor: '#c0c0c0',
                borderColor: '#444444',
                borderWidth: 1                
            }
        }
        // else {
        //     for (let [sk, sv] of Object.entries(v)) {
        //         columns.push([`${k} ${sk}`, ...sv]);
        //     }
        // }
    //}

    //return columns;
}

const makeChart = (data, entity) => {
    const config = {
        type: 'bar',
        data: {

            // x (categories) axis
            labels: data.categories.reverse(),
            datasets: [ values2columns(data, entity) ]
        },
        options: {

            // rotate the chart so the bars are horizontal
            indexAxis: 'y',

            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: entity
                }
            }
        }
    };

    const canvas = document.createElement('canvas');
    canvas.setAttribute('height', 300)

    const chartDiv = document.createElement('div');
    chartDiv.append(canvas);

    $('#db-charts').append(chartDiv);
    const chart = new Chart( canvas, config );
}

const makeCharts = (data) => {
    const entities = Object.keys(data.values);
    entities.forEach(entity => {
        if (Array.isArray(data.values[entity])) {
            makeChart(data, entity);
        }
    })
}

export { makeCharts }