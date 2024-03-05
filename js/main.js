// assign the access token
mapboxgl.accessToken =
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';

// declare the map object
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v9',
    zoom: 10.6, // starting zoom
    minZoom: 1,
    center: [-122.25, 47.6002614] // starting center
});

const grades = [0, '1 ~ 999', '1000 ~ 1999', '2000 ~ 2999', '3000 ~ 3999', '4000 ~ 4999', '5000 ~ 5999', '6000 ~ 6999', '7000 and above'],
    colors = [
        'rgb(217,217,217)',
        'rgb(255,255,204)',
        'rgb(255,237,160)',
        'rgb(254,217,118)',
        'rgb(254,178,76)',
        'rgb(253,141,60)',
        'rgb(252,78,42)',
        'rgb(227,26,28)',
        'rgb(177,0,38)'
    ];

const legend = document.getElementById('legend');
let labels = ['<strong>No. of Crime Reported</strong>'], vbreak;

for (var i = 0; i < grades.length; i++) {
    vbreak = grades[i];
    square_size = 10
    labels.push(
        '<p class="break"><i class="square" style="background:' + colors[i] + '; width: ' + square_size +
        'px; height: ' +
        square_size + 'px; "></i> <span class="square-label" style="top: ' + square_size / 2 + 'px;">' + vbreak +
        '</span></p>');
}

const source =
    '<p style="text-align: right; font-size:10pt">Source: <a href="https://data.seattle.gov/Public-Safety/SPD-Crime-Data-2008-Present/tazs-3rd5/about_data">Seattle Open Data</a></p>';

// join all the labels and the source to create the legend content.
legend.innerHTML = labels.join('') + source;

// define the asynchronous function to load geojson data.
async function geojsonFetch() {
    let response;
    response = await fetch('assets/seattleCrime2023.geojson');
    crime = await response.json();

    let response2;
    response2 = await fetch('assets/sngh_crime_data.geojson');
    crime_data = await response2.json();

    map.on('load', () => {
        // Add GeoJSON data as a source
        map.addSource('crime', {
            type: 'geojson',
            data: crime
        });

        // Circle Layer
        map.addLayer({
            id: 'dot-density',
            type: 'circle',
            source: 'crime',
            paint: {
                'circle-color': [
                    'match',
                    ['get', 'Offense Parent Group'],
                    'COUNTERFEITING/FORGERY', '#FF0000',  // Red for Counterfeiting/Forgery
                    'LARCENY-THEFT', '#00FF00',  // Green for Larceny/Theft
                    'ASSAULT OFFENSES', '#FFA500',  // Orange for Assault Offenses
                    'DESTRUCTION/DAMAGE/VANDALISM OF PROPERTY', '#ff3311',  // Custom color for Destruction/Damage/Vandalism of Property
                    'ROBBERY', '#800080',  // Purple for Robbery
                    'PORNOGRAPHY/OBSCENE MATERIAL', '#8B4513',  // Saddle Brown for Pornography/Obscene Material
                    'BURGLARY/BREAKING&ENTERING', '#0000FF',  // Blue for Burglary/Breaking&Entering
                    'DRUG/NARCOTIC OFFENSES', '#008080',  // Teal for Drug/Narcotic Offenses
                    'STOLEN PROPERTY OFFENSES', '#663399',  // Rebecca Purple for Stolen Property Offenses
                    'TRESPASS OF REAL PROPERTY', '#8A2BE2',  // Blue Violet for Trespass of Real Property
                    'ARSON', '#FF6347',  // Tomato for Arson
                    'MOTOR VEHICLE THEFT', '#FFFF00',  // Yellow for Motor Vehicle Theft
                    'FRAUD OFFENSES', '#00CED1',  // Dark Turquoise for Fraud Offenses
                    'DRIVING UNDER THE INFLUENCE', '#4B0082',  // Indigo for Driving Under the Influence
                    'EXTORTION/BLACKMAIL', '#FFD700',  // Gold for Extortion/Blackmail
                    'KIDNAPPING/ABDUCTION', '#9400D3',  // Dark Violet for Kidnapping/Abduction
                    'WEAPON LAW VIOLATIONS', '#ADFF2F',  // Green Yellow for Weapon Law Violations
                    'PEEPING TOM', '#2F4F4F',  // Dark Slate Gray for Peeping Tom
                    'FAMILY OFFENSES, NONVIOLENT', '#00FA9A',  // Medium Spring Green for Family Offenses, Nonviolent
                    'EMBEZZLEMENT', '#FF4500',  // Orange Red for Embezzlement
                    'ANIMAL CRUELTY', '#8B0000',  // Dark Red for Animal Cruelty
                    'BAD CHECKS', '#556B2F',  // Dark Olive Green for Bad Checks
                    'HOMICIDE OFFENSES', '#B22222',  // Fire Brick for Homicide Offenses
                    'HUMAN TRAFFICKING', '#D2691E',  // Chocolate for Human Trafficking
                    'PROSTITUTION OFFENSES', '#FF1493',  // Deep Pink for Prostitution Offenses
                    'BRIBERY', '#6A5ACD',  // Slate Blue for Bribery
                    'SEX OFFENSES, CONSENSUAL', '#9370DB',  // Medium Purple for Sex Offenses, Consensual
                    'LIQUOR LAW VIOLATIONS', '#B0C4DE',  // Light Steel Blue for Liquor Law Violations
                    'CURFEW/LOITERING/VAGRANCY VIOLATIONS', '#20B2AA',  // Light Sea Green for Curfew/Loitering/Vagrancy Violations
                    'GAMBLING OFFENSES', '#FF8C00',  // Dark Orange for Gambling Offenses
                    // Add more cases for other offense groups and their corresponding colors
                    'rgba(0, 0, 0, 0.1)'  // Default color for unknown groups
                ],
                'circle-radius': 5,
                'circle-opacity': .3
            }
        }, 'waterway-label');

             // Create legend
        const legendContainer = document.getElementById('legend-container');

        // Function to toggle layer visibility
        function toggleLayerVisibility(layerName) {
            const visibility = map.getLayoutProperty('dot-density', 'visibility');
            const visibleLayers = visibility === 'visible' ? map.getStyle().layers : [];

            if (visibleLayers.includes('dot-density')) {
                map.setLayoutProperty('dot-density', 'visibility', 'none');
            }

            map.setLayoutProperty('dot-density', 'visibility', 'visible');
            map.setFilter('dot-density', ['==', 'Offense Parent Group', layerName]);
        }

        // Append legend items to legend container with interactivity
        crime.features.forEach(feature => {
            const crimeType = feature.properties['Offense Parent Group'];

            if (legendContainer.querySelector(`[data-type="${crimeType}"]`) === null) {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.setAttribute('data-type', crimeType);

                const legendColor = document.createElement('div');
                legendColor.className = 'legend-color';
                legendColor.style.backgroundColor = getColorForCrimeType(crimeType);

                const legendLabel = document.createElement('div');
                legendLabel.className = 'legend-label';
                legendLabel.textContent = crimeType;

                legendItem.appendChild(legendColor);
                legendItem.appendChild(legendLabel);

                // Add click event to toggle layer visibility
                legendItem.addEventListener('click', () => {
                    toggleLayerVisibility(crimeType);
                });

                // Add hover event to update styling
                legendItem.addEventListener('mouseover', () => {
                    legendItem.style.backgroundColor = '#9b9898';
                    legendItem.style.fontWeight = 'bold';
                });

                legendItem.addEventListener('mouseout', () => {
                    legendItem.style.backgroundColor = '';
                    legendItem.style.fontWeight = '';
                });

                legendContainer.appendChild(legendItem);
            }
        });
    });

    map.addSource('seattle-neighborhoods', {
        'type': 'geojson',
        'data': crime_data
    });

    map.addLayer({
        'id': 'choropleth-map',
        'type': 'fill',
        'source': 'seattle-neighborhoods',
        'paint': {
            'fill-color': [
                'step',
                ['get', 'crime_count'],
                'rgba(0, 0, 255, 0)',
                // colors from https://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=7
                0, 'rgb(217,217,217)',
                1, 'rgb(255,255,204)',
                1000, 'rgb(255,237,160)',
                2000, 'rgb(254,217,118)',
                3000, 'rgb(254,178,76)',
                4000, 'rgb(253,141,60)',
                5000, 'rgb(252,78,42)',
                6000, 'rgb(227,26,28)',
                7000, 'rgb(177,0,38)'
            ],
            'fill-opacity': 0.75
        }
    });

    map.on('click', 'choropleth-map', (event) => {
        const nghName = event.features[0].properties.S_HOOD;
        const crimeCount = event.features[0].properties.crime_count;
        const tractInfo = `<strong>Neighborhood:</strong> ${nghName}<br><strong>Number of crimes reported: </strong>${crimeCount}`;
        new mapboxgl.Popup()
            .setLngLat(event.lngLat)
            .setHTML(tractInfo)
            .addTo(map);
    });

    map.setLayoutProperty('choropleth-map', 'visibility', 'none');
}

function getColorForCrimeType(crimeType) {
    // Define color mapping based on crime type
    const colorMapping = {
        'COUNTERFEITING/FORGERY': '#FF0000',
        'LARCENY-THEFT': '#00FF00',
        'ASSAULT OFFENSES': '#FFA500',
        'DESTRUCTION/DAMAGE/VANDALISM OF PROPERTY': '#ff3311',
        'ROBBERY': '#800080',
        'PORNOGRAPHY/OBSCENE MATERIAL': '#8B4513',
        'BURGLARY/BREAKING&ENTERING': '#0000FF',
        'DRUG/NARCOTIC OFFENSES': '#008080',
        'STOLEN PROPERTY OFFENSES': '#663399',
        'TRESPASS OF REAL PROPERTY': '#8A2BE2',
        'ARSON': '#FF6347',
        'MOTOR VEHICLE THEFT': '#FFFF00',
        'FRAUD OFFENSES': '#00CED1',
        'DRIVING UNDER THE INFLUENCE': '#4B0082',
        'EXTORTION/BLACKMAIL': '#FFD700',
        'KIDNAPPING/ABDUCTION': '#9400D3',
        'WEAPON LAW VIOLATIONS': '#ADFF2F',
        'PEEPING TOM': '#2F4F4F',
        'FAMILY OFFENSES, NONVIOLENT': '#00FA9A',
        'EMBEZZLEMENT': '#FF4500',
        'ANIMAL CRUELTY': '#8B0000',
        'BAD CHECKS': '#556B2F',
        'HOMICIDE OFFENSES': '#B22222',
        'HUMAN TRAFFICKING': '#D2691E',
        'PROSTITUTION OFFENSES': '#FF1493',
        'BRIBERY': '#6A5ACD',
        'SEX OFFENSES, CONSENSUAL': '#9370DB',
        'LIQUOR LAW VIOLATIONS': '#B0C4DE',
        'CURFEW/LOITERING/VAGRANCY VIOLATIONS': '#20B2AA',
        'GAMBLING OFFENSES': '#FF8C00',
        'rgba(0, 0, 0, 0.1)': '#CCCCCC'
    };

    return colorMapping[crimeType] || '#CCCCCC';
}

// Invoke the function to fetch GeoJSON and set up the map
geojsonFetch();

// capture the element reset and add a click event to it.
const reset = document.getElementById('reset');
reset.addEventListener('click', event => {
    // This event will trigger a page refresh
    location.reload();
});

// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // If these all 4 layers were not added to the map, abort
    if (!map.getLayer('dot-density') || !map.getLayer('choropleth-map')) {
        return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = ['dot-density', 'choropleth-map'];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id; // You might want to use a more user-friendly name here
        link.className = 'inactive';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            // preventDefault() tells the user agent that if the event does not get explicitly handled, 
            // its default action should not be taken as it normally would be.
            e.preventDefault();
            // The stopPropagation() method prevents further propagation of the current event in the capturing 
            // and bubbling phases. It does not, however, prevent any default behaviors from occurring; 
            // for instance, clicks on links are still processed. If you want to stop those behaviors, 
            // see the preventDefault() method.
            e.stopPropagation();

            // Iterate over all toggleable layers to set them to 'none', except for the clicked one.
            toggleableLayerIds.forEach(function(layerId) {
                const visibility = map.getLayoutProperty(layerId, 'visibility');
                if (layerId === id) {
                    if (visibility !== 'visible') {
                        map.setLayoutProperty(layerId, 'visibility', 'visible');
                        link.className = 'active';
                        // Show the legend if the choropleth-crime layer is being activated
                        if (layerId === 'choropleth-map') {
                            document.getElementById('legend').style.display = 'block';
                        }
                    }
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                    const otherLink = document.getElementById(layerId);
                    if (otherLink) {
                        otherLink.className = 'inactive';
                    }
                    // Hide the legend if the choropleth-crime layer is being deactivated
                    if (layerId === 'choropleth-map') {
                        document.getElementById('legend').style.display = 'none';
                    }
                }
            });
        };

        // in the menu placeholder, insert the layer links.
        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
});