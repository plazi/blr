import { $, $$ } from './utils.js';

const values2columns = (data, entity) => {
    const values = data.values[entity];

    if (Array.isArray(values)) {
        return { 
            label: entity, 
            data: values,
            backgroundColor: '#c0c0c0',
            borderColor: '#444444',
            borderWidth: 1                
        }
    }
}

const charts = {};

const makeChart = (data, entity) => {
    const config = {
        type: 'bar',
        data: {

            // x (categories) axis
            labels: data.categories,
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
    canvas.setAttribute('height', 260)

    const listDiv = document.createElement('li');
    listDiv.setAttribute('class', 'slide');
    listDiv.append(canvas);

    $('#slides-container').append(listDiv);
    const chart = new Chart(canvas, config);
    charts[entity] = chart;
}

const makeCharts = (data) => {
    const entities = Object.keys(data.values);

    entities.forEach(entity => {        
        if (Array.isArray(data.values[entity])) {
            makeChart(data, entity);
        }
    });

    initSlides();
}

const initSlides = () => {
    const slidesContainer = $("#slides-container");
    const slide = $(".slide");
    
    $("#slide-arrow-next").addEventListener("click", (event) => {
        const slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft += slideWidth;
    });
    
    $("#slide-arrow-prev").addEventListener("click", (event) => {
        const slideWidth = slide.clientWidth;
        slidesContainer.scrollLeft -= slideWidth;
    });
}

const updateCharts = (data) => {
    const entities = Object.keys(data.values);

    entities.forEach(entity => {
        if (Array.isArray(data.values[entity])) {
            const chart = charts[entity];
            chart.data.labels = data.categories;
            chart.data.datasets = [ values2columns(data, entity) ]
            chart.update();
        }
    });
}

export { makeCharts, updateCharts }