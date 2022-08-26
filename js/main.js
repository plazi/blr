import { $, $$ } from './utils.js';
import { initDashboard, updateDashboard } from './db.js';
import { getResults, renderResults, closePage } from './blr.js';

const loadPage = async (event) => {
    const target = event ? event.target : window.location;
    const tgt = target.href.split('/').pop().split('.')[0];
    let page = 'index';

    const validPages = [
        'apis',
        'about',
        'liberating-data',
        'how-blr-works',
        'contribute',
        'blog'
    ]

    if (validPages.includes(tgt)) {
        page = tgt;
    }

    // hide all the pages
    $$('article').forEach(el => el.classList.add('hidden'));

    // show the targetPage
    $(`#${page}`).classList.remove('hidden');

    // attach listeners
    $$('.nav-link').forEach(l => l.addEventListener('click', loadPage));
    $$('button.close').forEach(b => b.addEventListener('click', closePage));
    $$('form button').forEach(b => b.addEventListener('click', go));
    $('form').addEventListener('submit', go);

    // if event exists then loadPage() has been called 
    // via clicking a menu link
    if (event) {
        event.stopPropagation();
        event.preventDefault();

        // change the URL
        history.pushState(null, '', `${page}.html`);

        // hide the form
        $('form').classList.add('hidden');
    }

    // event doesn't exist because loadPage() has been 
    // called on first load of the webpage or via a 
    // bookmark
    else {

        if (page === 'index') {

            // show the form
            $('form').classList.remove('hidden');

            if (target.search) {
                const query = target.search.substring(1);
                const m = query.match(/q=(?<q>\w+)&?/);

                if (m.groups && ('q' in m.groups)) {
                    $('#query_string').value = m.groups.q;
                }
                
                queryAndRender(query, 'bookmark');
            }
            else {
                queryAndRender('cols=', 'firstLoad');
            }
        }
    }
}

// form button click or submit
const go = async (event) => {
    
    /** 
     * 'q' will be 'q' or 
     * 'treatmentTitle' or 
     * 'journalTitle' or 
     * 'authorityName'
    **/
    const checkInputs = [ ...$$('input[name=type]') ];
    const q = checkInputs.filter(c => c.checked)[0].value;
 
    const qs = $('#query_string').value;
    const query = `${q}=${qs}`;
 
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
 
    event.stopPropagation();
    event.preventDefault();

    queryAndRender(query, 'go');
}

// next | prev click
const pagePage = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target;
    const query = target.href.split('?')[1].split('&')[0];

    queryAndRender(query, 'pagePage');
}

const queryAndRender = async (query, type) => {

    // get and render the results
    // res = { count, records, stats, _links }
    const res = await getResults(query);
    
    if (res.count) {

        // There are four kinds of calls
        // - firstLoad (by typing the website in the browser)
        // - bookmark (by clicking a bookmark with search terms)
        // - go (by clicking the form button)
        // - pagePage (by clicking the prev|next buttons)
        if (type !== 'firstLoad') {
            renderResults(res);
            $$('.page').forEach(p => p.addEventListener('click', pagePage));
        }

        if (type === 'firstLoad'|| type === 'bookmark') {
            initDashboard(res.stats);
        }
        else if (type === 'go'|| type === 'pagePage') {
            updateDashboard(res.stats);
        }
    }
    else {
        renderResults({ count: 0 });
    }
}

export { loadPage }