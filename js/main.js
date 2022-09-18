import { $, $$ } from './utils.js';
import { initDashboard, updateDashboard } from './db.js';
import { getResults, renderResults } from './blr.js';

/*
The web page responds 

1. to a fullpage load via direct access to the base address plus, optionally, some query params

    A page load is accomplished via an optional fetching of results from the server, manipulating the DOM (hiding and showing sections), rendering the results.

2. to mouseclicks on links
3. to form submission
4. to browser forward or backward button clicks via the `history` API
*/


const init = () => {
    attachListeners();
    loadPage();
}

// 1. fullpage load
const loadPage = () => {
    const target = window.location;
    const page = target.pathname.split('/').pop().split('.')[0] || 'index';
    reveal(page);

    let query = 'cols=';
    let typeOfQuery = 'firstLoad';

    if (target.search) {
        query = target.search.substring(1);
        const m = query.match(/q=(?<q>\w+)&?/);

        // update the form so it is clear what is being searched
        if (m.groups && ('q' in m.groups)) {
            $('#query_string').value = m.groups.q;
            typeOfQuery = 'bookmark';
        }
    }

    queryAndRender(query, typeOfQuery);
}

const loadPseudoPage = (event) => {
    const page = event.target.href.substring(1);
    reveal(page);
}

const attachListeners = () => {
    $$('.nav-link').forEach(el => el.addEventListener('click', loadPseudoPage));
    $$('form button').forEach(el => el.addEventListener('click', go));
    $('form').addEventListener('submit', go);
}

const reveal = (page) => {

    // hide all the pages
    $$('article').forEach(el => el.classList.add('hidden'));

    if (page === 'index') {
        $('#dashboard').classList.remove('hidden');
        $('form').classList.remove('hidden');
    }
    else {
        $('#dashboard').classList.add('hidden');
        $('form').classList.add('hidden');
    }

    // show the targetPage
    $(`#${page}`).classList.remove('hidden');
}

/*
2. Load a page by submitting a form
*/
const go = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    
    const qs = $('#query_string').value;
    if (!qs) {
        $('#query_string').placeholder = 'Please enter a search term';
        setTimeout(() => $('#query_string').placeholder = 'Search', 2000);
        return;
    }

    /** 
     * 'q' will be 'q' or 
     * 'treatmentTitle' or 
     * 'journalTitle' or 
     * 'authorityName'
    **/
    const checkInputs = [ ...$$('input[name=type]') ];
    const q = checkInputs.filter(c => c.checked)[0].value;
    const query = `${q}=${qs}`;
 
    /**
     * first, deactivate all the buttons by removing 
     * 'active' class and adding 'inactive' class
    **/
    $$('form button').forEach(b => {
        b.classList.remove('active');
        b.classList.add('inactive');
    });
 
    /**
     * now, activate the target button
    **/
    event.target.classList.remove('inactive');
    event.target.classList.add('spinning');

    queryAndRender(query, 'go');
}

const queryAndRender = async (query, typeOfQuery) => {

    // get and render the results
    // res = { count, records, stats, _links }
    const res = await getResults(query);
    
    if (res.count) {

        // There are four kinds of calls
        // - firstLoad (by typing the website in the browser)
        // - bookmark (by clicking a bookmark with search terms)
        // - go (by clicking the form button)
        // - pagePage (by clicking the prev|next buttons)
        if (typeOfQuery !== 'firstLoad') {
            renderResults(res);
            $$('.page').forEach(p => p.addEventListener('click', pagePage));
        }

        if (typeOfQuery === 'firstLoad' || typeOfQuery === 'bookmark') {
            initDashboard(res.stats);
        }
        else if (typeOfQuery === 'go'|| typeOfQuery === 'pagePage') {
            updateDashboard(res.stats);
        }
    }
    else {
        renderResults({ count: 0 });
    }

    if (typeOfQuery !== 'bookmark') {
        updateBrowserBar(query);
    }
}

const updateBrowserBar = (query) => {
    //const pathname = window.location.pathname.substring(1);

    if (query !== 'cols=') {
        history.pushState({}, null, `?${query}`);
    }
}

// next | prev click
const pagePage = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target;
    const query = target.href.split('?')[1];
    queryAndRender(query, 'pagePage');
}

export { init }