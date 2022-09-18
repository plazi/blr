import { $, $$ } from './utils.js';

const getResults = async (query) => {
    const origQuery = query;
    query = query + '&stats=true';

    const z = window.location.hostname === 'localhost' 
        ? 'http://localhost:3010/v3' 
        : 'https://test.zenodeo.org/v3';
        
    const response = await fetch(`${z}/treatments?${query}`);

    // if HTTP-status is 200-299
    if (response.ok) {

        if (window.location.pathname === '/index.html') {
            if (origQuery !== 'cols=') {
                history.pushState(null, null, `index.html?${origQuery}`);
            }
        }
        
        // get the response body
        const json = await response.json();

        return {
            count: json.item.result.count,
            records: json.item.result.records,
            stats: json.item.result.stats,
            _links: json.item._links
        }
    } 
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const renderResults = (res) => {
    const { count, records, _links } = res;
    const resource = 'treatments';

    if (count) {
        const resources = {
            treatments: 'Taxon Treatments',
            images: 'Images',
            publications: 'Publications'
        }
        
        $(`#treatments`).innerHTML = `Taxon Treatments ${count}`;

        const str = formatRecords(records);
        $('#results').innerHTML = str;
        
        if (count > 30) {
            $('#pager').innerHTML = getPager(_links);
        }
    }
    else {
        $('#results').innerHTML = '<p>Nothing found</p>';
    }
    /** 
     * remove spinning animation from the current button
    **/
    Array.from($$('form button'))
        .filter(b => b.id === resource)[0]
        .classList.remove('spinning');
}

const pagePart = (link) => {
    const url = new URL(link);
    url.searchParams.delete('stats');
    return url.searchParams.toString();
}

const getPager = (_links) => {    
    const prev = pagePart(_links._prev);
    const next = pagePart(_links._next);

    return `<a href="/index.html?${prev}" class="page">prev</a> <a href="/index.html?${next}" class="page">next</a>`;
}

const formatRecords = (records) => {
    return records.map(r => `<div class="record">
<h2>${r.treatmentTitle}</h2>
<p>${r.articleTitle}</p>
<a href="${r.articleDOI}" class="doi">${r.articleDOI}</a><br>
<a href="http://treatment.plazi.org/id/${r.treatmentId}" class="recBtn">Treatment Bank</a> <a href="https://zenodo.org/record/${r.zenodoDep}" class="recBtn">Zenodo</a>
</div>`).join('\n');
}

export { getResults, renderResults }