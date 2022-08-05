const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const loadPage = (e) => {
    let page = 'index';

    if (e) {
        e.stopPropagation();
        e.preventDefault();
        page = e.target.href.split('/').pop().split('.')[0];
    }
    else {
        page = location.href.split('/').pop().split('.')[0];
    }

    const target = $(`#${page}`);
    history.pushState(null, null, `${page}.html`);

    $$('article').forEach(el => el.classList.add('hidden'));
    
    if (page === 'index') {
        $('form').classList.remove('hidden');
    }
    else {
        $('form').classList.add('hidden');
    }

    target.classList.remove('hidden');
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

pager = (_links) => `<a href="${_links._prev}" class="page">prev</a> <a href="${_links._next}" class="page">next</a>`;

const resources = {
    treatments: 'Taxon Treatments',
    images: 'Images',
    publications: 'Publications'
}

const getResults = async (resource, url) => {
    const response = await fetch(`${z}/${resource}?${url}`);

    // if HTTP-status is 200-299
    if (response.ok) {
        
        // get the response body
        const json = await response.json();
        const count = json.item.result.count;
        const records = json.item.result.records;
        const facets = json.item.result.facets;
        const _links = json.item._links;

        $(`#${resource}`).innerHTML = `${resources[resource]} ${count}`;

        innerHTML = formatRecords(resource, records);
        $('#results').innerHTML = innerHTML;

        /** 
         * remove spinning animation from the current button
        **/
        Array.from($$('form button'))
            .filter(b => b.id === resource)[0]
            .classList.remove('spinning');

        $('#pager').innerHTML = pager(_links);
    } 
    else {
        alert("HTTP-Error: " + response.status);
    }
}

const go = (e) => {
    const resource = e.target.id;
    const qs = $('#query_string').value;
    const checkInputs = [ ...$$('input[name=type]') ];
    const q = checkInputs.filter(c => c.checked)[0].value;
    const url = `${q}=${qs}&facets=true`;

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
     */
    e.target.classList.remove('inactive');
    e.target.classList.add('spinning');
    getResults(resource, url);
    e.stopPropagation();
    e.preventDefault();
}

$$('.nav-link').forEach(l => l.addEventListener('click', loadPage));
$$('form button').forEach(b => b.addEventListener('click', go));
$('form').addEventListener('submit', go);

const search = function(e) {
    const search_results = document.getElementById('search_results')

    fetch('https://tb.plazi.org/GgServer/srsStats/stats?outputFields=doc.type+doc.uuid+doc.name+doc.uploadDate+bib.author+bib.title+tax.name&groupingFields=doc.type+doc.uuid+doc.name+doc.uploadDate+bib.author+bib.title+tax.name&FP-doc.uploadDate=%222021-07-16%22&format=JSON')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status)
            }

            return response.json()
        })
        .then(function(response) {
            const data = response.data
            let res = '<h2>Latest Treatments</h2>'
            data.forEach(r => {
                res += '<details><summary>' + r.TaxName + '</summary><p>' + r.BibTitle + ', ' + r.BibAuthor + '</p></details>'
            })

            search_results.innerHTML = res
        })

    e.stopPropagation()
    e.preventDefault()
}

    // window.onload = function(e) {
    //     const searchBtn = document.getElementById('searchBtn')
    //     searchBtn.addEventListener('click', search)
    // }()
const loadMap = () => {
    fetch('https://tb.plazi.org/GgServer/srsStaticStats/latestMapPoints.json', {mode: 'cors'})
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error, status = ' + response.status);
            }

            return response.json();
        })
        .then(function(response) {
        const points = response.data
        const center = [0, 0]
        //const accessToken = 'pk.eyJ1IjoiZmljaHQiLCJhIjoiY2locWQ3YTBtMDAxYnY1bHVvcGtsM2Y1MCJ9.C8NlGmZuX6W2YrvXTHULeQ'
        const mymap = L.map('map').setView(center, 2)

        // initialize the baselayer
        //const mapurl = 'https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
        const mapurl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(mapurl, {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mymap);

        const url = 'https://tb.plazi.org/GgServer/html/';

        const icon = L.icon({ 
            iconUrl: 'img/treatment.png', 
            iconSize: [10, 10],
            iconAnchor: [0, 0],
            popupAnchor: [6, 5]
        });

        for (let i = 0, j = points.length; i < j; i++) {
            const p = points[i]
            const popupHtml =  
                `<div class='TaxName'>
                    <a href='${url}/${p.DocUuid}' target='_blank'>${p.TaxName}</a>
                </div>
                <div class='BibDspTitle'>${p.BibDspTitleDsp}</div>
                <div class='BibOrigin'>${p.BibOrigin}</div>`
            L.marker([Number(p.MatCitLatitude), Number(p.MatCitLongitude), ], { icon: icon })
                .bindPopup(popupHtml)
                .addTo(mymap)
        }
    })
}