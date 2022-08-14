import { $, $$ } from './utils.js';
import { initDashboard, updateDashboard } from './db.js';

const loadPage = (event) => {
    const target = event ? event.target : location;
    const tgt = target.href.split('/').pop().split('.')[0];
    const page = tgt || 'index';

    // hide all the pages
    $$('article').forEach(el => el.classList.add('hidden'));

    // show the targetPage
    const targetPage = $(`#${page}`);
    targetPage.classList.remove('hidden');

    // if event exists then loadPage() has been called 
    // via clicking a menu link
    if (event) {
        event.stopPropagation();
        event.preventDefault();

        // change the URL
        history.pushState(null, null, `${page}.html`);

        // hide the form
        $('form').classList.add('hidden');
    }

    // event doesn't exist because loadPage() has been 
    // called on first load of the webpage
    else {

        // show the form
        $('form').classList.remove('hidden');

        // attach listeners
        $$('.nav-link').forEach(l => l.addEventListener('click', loadPage));
        $$('form button').forEach(b => b.addEventListener('click', go));
        $('form').addEventListener('submit', go);

        getResults({
            resource: 'treatments', 
            query: 'cols=&stats=true',
            renderResults: false
        });
    }
}

const go = (event) => {

    /** 
     * 'resource' will be 'treatments' or 
     * 'images' or 
     * 'publications'
    **/
    const resource = event.target.id;
    
    /** 
     * 'q' will be 'q' or 
     * 'treatmentTitle' or 
     * 'journalTitle' or 
     * 'authorityName'
    **/
    const checkInputs = [ ...$$('input[name=type]') ];
    const q = checkInputs.filter(c => c.checked)[0].value;

    const qs = $('#query_string').value;
    const query = `${q}=${qs}&stats=true`;

    /**
     * first, deactivate all the buttons by removing 
     * 'active' class and adding 'inactive' class
    **/
    $$('form button').forEach(b => {
        b.classList.remove('active');
        b.classList.add('inactive')
    });

    /**
     * now, activate the target button
    **/
    event.target.classList.remove('inactive');
    event.target.classList.add('spinning');

    /**
     * get the results
    **/
    getResults({
        resource, 
        query,
        renderResults: true
    });

    event.stopPropagation();
    event.preventDefault();
}

const getResults = async ({ resource, query, renderResults = false}) => {
    const response = await fetch(`${z}/${resource}?${query}`);

    // if HTTP-status is 200-299
    if (response.ok) {
        
        // get the response body
        const json = await response.json();
        const count = json.item.result.count;
        const records = json.item.result.records;
        //const facets = json.item.result.facets;
        const stats = json.item.result.stats;
        const _links = json.item._links;

        /** 
         * when getResults() is called as a result of a form 
         * submit, 'renderResults' is true. The treatments are 
         * rendered as a list, and the dashboard is updated 
         * as it already exists
         * */
        if (renderResults) {
            const resources = {
                treatments: 'Taxon Treatments',
                images: 'Images',
                publications: 'Publications'
            }
            
            $(`#${resource}`).innerHTML = `${resources[resource]} ${count}`;

            const str = formatRecords(resource, records);
            $('#results').innerHTML = str;

            /** 
             * remove spinning animation from the current button
            **/
            Array.from($$('form button'))
                .filter(b => b.id === resource)[0]
                .classList.remove('spinning');

            $('#pager').innerHTML = `<a href="${_links._prev}" class="page">prev</a> <a href="${_links._next}" class="page">next</a>`;

            // update the dashboard
            updateDashboard(stats);
        }

        /**
         * first time the page loads, 'renderResults' is false
         * so the dashboard is initiliazed but the treatments are 
         * not rendered in a list
         */
        else {

            // initialize the dashboard
            initDashboard(stats)
        }
    } 
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const formatRecords = (resource, records) => {
    if (resource === 'treatments') {
        return records.map(r => `<div class="record">
<h2>${r.treatmentTitle}</h2>
<p>${r.articleTitle}</p>
<a href="${r.articleDOI}" class="doi">${r.articleDOI}</a><br>
<a href="http://treatment.plazi.org/id/${r.treatmentId}" class="recBtn">Treatment Bank</a> <a href="https://zenodo.org/record/${r.zenodoDep}" class="recBtn">Zenodo</a>
</div>`).join('\n');
    }
    else if (resource === 'images') {
        return records.map(r => `<div class="record">
<h2>${r.metadata.title}</h2>
<figure>
<img src="https://zenodo.org/record/${r.id}/thumb250" width="250">
<figcaption>${r.metadata.description}</figcaption>
</figure>
<a href="${r.doi}" class="doi">${r.doi}</a>
</div>`).join('\n');
    }
    else if (resource === 'publications') {
        return records.map(r => `<div class="record">
<h2>${r.metadata.title}</h2>
<p>${r.metadata.description}</p>
<a href="${r.doi}" class="doi">${r.doi}</a>
</div>`).join('\n');
    }
}

export { loadPage }