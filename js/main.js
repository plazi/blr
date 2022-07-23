const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const loadPage = (e) => {
    let page;

    if (e) {
        e.stopPropagation();
        e.preventDefault();
        page = e.target.href.split('/').pop().split('.')[0];
    }
    else {
        page = location.href.split('/').pop().split('.')[0];
    }

    const target = $('main article');
    target.innerHTML = pages[page];
    history.pushState(null, null, `${page}.html`);
    $('form').classList.add('hidden');
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
const pages = {
    about: `<h1>About</h1><br>
<p>The Biodiversity Literature Repository (BLR) has been growing from a community on <a target="_blank" href="https://zenodo.org/">Zenodo</a> to be a service dedicated to liberate and make open access, FAIR (findable, accessible, interoperable and reusable) data hidden in the hundreds of millions of pages of scholarly publications.</p>
<p>It is built on top of <a target="_blank" href="https://zenodo.org/">Zenodo</a>, a digital repository hosted at <a target="_blank" href="https://home.cern/">CERN</a>, which provides a sustainable and robust infrastructure for long tail research data, which can consist of small datasets that otherwise would be lost.</p>
<p>Originally a collaboration between <a target="_blank" href="https://zenodo.org/">Zenodo</a>, <a target="_blank" href="http://plazi.org">Plazi</a> and <a target="_blank" href="https://pensoft.net/">Pensoft</a>, BLR began as a repository for taxonomic publications which lacked Digital Object Identifiers (<a target="_blank" href="https://datacite.org/dois.html">DOI</a>) and thus were effectively orphaned from the network of online citations. As it grew its scope expanded to morphed into a highly interlinked repository that focuses on include illustrations and taxonomic treatments contained in publications with all these content types interlinked among themselves and enhanced with and rich metadata. </p>
<p>The source data for BLR are scholarly publications that are most often in PDF or html format but sometimes in XML formats whose structured data facilitates the automated data extraction.</p>
<p>The largest data users are the Global Biodiversity Information Facility (<a target="_blank" href="https://www.gbif.org/">GBIF</a>) and the United States’ National Center for Biotechnology Information (<a target="_blank" href="https://www.ncbi.nlm.nih.gov/">NCBI</a>).</p>
<p>Support of BLR comes from the <a target="_blank" href="https://www.arcadiafund.org.uk">Arcadia Fund</a> and the three partner institutions <a target="_blank" href="https://zenodo.org/">Zenodo</a>, <a target="_blank" href="http://plazi.org">Plazi</a> and <a target="_blank" href="https://pensoft.net/">Pensoft</a>.</p>`,
    'liberating-data': `<h1>Liberating Data</h1>
<p>Content is prepared for deposit in BLR via two workflows. Most often data mining processes extract content from PDF or HTML, identifying and labelling relevant data elements, either named entities such as DNA accession codes or geographic localities, or larger textual segments such as material citations and entire treatments. This can be automated by developing templates for each journal. During the upload of the data to BLR, each deposited object (article, treatment, or image) is assigned a DOI, which is cited by each related object. In the best case scenario, this process is completely automated. An advanced workflow is based on publications that have already structured data based on standard vocabularies that machines can understand.</p>
<p>After each article deposit in BLR, GBIF is notified that a new data set derived from the content of the publication is available subsequently GBIF downloads and integrates the data in its service.</p>
<p>The entire process from PDF via BLR to GBIF can take just a couple of minutes.</p>
<p>Liberation also means dissemination. Collaboration with global research infrastructures such as GBIF promotes usage and also promotes the improvement of data structure and quality.</p>`,
    apis: `<h1>APIs</h1>
<ul>
<li><a target="_blank" href="https://zenodeo.org/docs">Zenodeo</a></li>
<li><a target="_blank" href="https://developers.zenodo.org/">Zenodo</a></li>
<li><a target="_blank" href="https://synospecies.plazi.org/">Synospecies</a></li>
<li><a target="_blank" href="http://openbiodiv.net">OpenBiodiv</a></li>
<li><a target="_blank" href="https://ocellus.info/">Ocellus</a></li>
</ul>`,
    'how-blr-works': `<h1>How BLR Works</h1>
<p>BLR works by providing access to parts of publications that are cited within the corpus of biodiversity literature. A taxonomic name usage implicitly cites a clearly delimited section of a scientific publication, called a taxonomic treatment. A taxonomic treatment contains further citations, to other treatments and thus, to publications, to figures, specimens in a collection, or even DNA sequences.</p>
<p>The corpus of biodiversity literature includes tens of millions of figures and taxonomic treatments, which are, therefore, the fundamental building blocks on which knowledge of the world’s biological diversity is based. To make them more open accessible, the BLR team designed the upload types for the deposit of figures and articles with enhanced metadata, For taxonomic treatments, Zenodo created a new resource subtype of the resource type “publication” which maps to DataCite’s general resource type “text”. This allows to mint for all the figures and taxonomic treatments Digital Object Identifiers (DOI).</p>
<p>All publications after 1999 are accessible according to the licenses assigned by their publishers. Publications prior to 2000 are open access. Taxonomic treatments and figures being scientific data, are thus not copyrightable, and since extracted from legally accessible sources, are thus made openly accessible.</p><p>The development and maintenance of BLR is organized during biannual sprints at CERN where all partners participate.</p>
<p>The data use is open and depositing of new research related data is free.</p>`,
    contribute: `<h1>Contribute</h1>
<p>You can contribute by making your publications open access, by learning how to arrange your scientific data and text so automated processing can apply, by publishing in semantically enhanced journals, by learning how to convert articles, by including BLR services in research grants and by supporting the activity financially.</p>`,
    blog: `<h1>Blog</h1>
<p>Articles about BLR are available in blogs of the three partners: <a target="_blank" href="https://blog.zenodo.org/">Zenodo</a>, <a target="_blank" href="http://plazi.org/news/">Plazi</a> and <a target="_blank" href="https://blog.pensoft.net/">Pensoft</a>.</p>`
};

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