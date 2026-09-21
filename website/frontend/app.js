// ========================================
// NER SMART LOGISTICS GIS
// Stage 1
// ========================================

let environmentalData = [];

fetch("/data/environmental_data.json")
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Could not load environmental data");
        }
        return response.json();
    })
    .then(function(data) {
        environmentalData = data.locations;

        console.log(
            "Environmental data loaded:",
            environmentalData
        );
    })
    .catch(function(error) {
        console.error(
            "Environmental data error:",
            error
        );
    });

    function findNearestEnvironmentalPoint(lat, lon) {

    if (environmentalData.length === 0) {
        return null;
    }

    let nearestPoint = null;
    let smallestDistance = Infinity;

    environmentalData.forEach(function(point) {

        const latDiff = lat - point.lat;
        const lonDiff = lon - point.lon;

        const distance =
            (latDiff * latDiff) +
            (lonDiff * lonDiff);

        if (distance < smallestDistance) {
            smallestDistance = distance;
            nearestPoint = point;
        }
    });

    return nearestPoint;
}


// Create map
const map = L.map("map").setView(
    [25.5, 92.0],
    6
);


// OpenStreetMap base map
const osmLayer = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; OpenStreetMap contributors'
    }
);

osmLayer.addTo(map);


// ========================================
// LAYERS
// ========================================

const stateLayer = L.layerGroup();

const roadLayer = L.layerGroup();


// ========================================
// NER STATES / CAPITALS
// ========================================

const states = [

    {
        name: "Arunachal Pradesh",
        capital: "Itanagar",
        lat: 27.0844,
        lon: 93.6053
    },

    {
        name: "Assam",
        capital: "Dispur",
        lat: 26.1433,
        lon: 91.7898
    },

    {
        name: "Manipur",
        capital: "Imphal",
        lat: 24.8170,
        lon: 93.9368
    },

    {
        name: "Meghalaya",
        capital: "Shillong",
        lat: 25.5788,
        lon: 91.8933
    },

    {
        name: "Mizoram",
        capital: "Aizawl",
        lat: 23.7271,
        lon: 92.7176
    },

    {
        name: "Nagaland",
        capital: "Kohima",
        lat: 25.6751,
        lon: 94.1086
    },

    {
        name: "Sikkim",
        capital: "Gangtok",
        lat: 27.3389,
        lon: 88.6065
    },

    {
        name: "Tripura",
        capital: "Agartala",
        lat: 23.8315,
        lon: 91.2868
    }

];


// ========================================
// CREATE CAPITAL MARKERS
// ========================================

states.forEach(function(state) {

    const marker = L.marker([
        state.lat,
        state.lon
    ]);

    marker.bindPopup(`
        <div>
            <div class="popup-title">
                ${state.name}
            </div>

            <p>
                Capital: ${state.capital}
            </p>

            <p>
                GIS Status: Active
            </p>
        </div>
    `);


    marker.on("click", function() {

        document.getElementById(
            "locationInfo"
        ).innerHTML = `
            <strong>${state.name}</strong>
            <br>
            Capital: ${state.capital}
            <br>
            Status: GIS Active
        `;

    });


    marker.addTo(stateLayer);

});


// Add state markers to map
stateLayer.addTo(map);
// ========================================
// NER STATE BOUNDARIES
// ========================================

const nerStates = [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura"
];


fetch("/data/ner_states.geojson")

    .then(function(response) {

        if (!response.ok) {
            throw new Error("GeoJSON file could not be loaded");
        }

        return response.json();

    })

    .then(function(data) {

        console.log("NER GeoJSON loaded successfully.");

        const nerBoundaryLayer = L.geoJSON(data, {

            // ========================================
            // FILTER ONLY 8 NER STATES
            // ========================================

            filter: function(feature) {

                const stateName =
                    feature.properties.ST_NM ||
                    feature.properties.name ||
                    feature.properties.NAME ||
                    "";

                return nerStates.includes(stateName);
            },


            // ========================================
            // STATE STYLE
            // ========================================

            style: function(feature) {

    return {
        color: "#94a3b8",
        weight: 2,
        fillColor: "#64748b",
        fillOpacity: 0.08
    };

},


            // ========================================
            // STATE INFORMATION
            // ========================================

            onEachFeature: function(feature, layer) {

                const stateName =
                    feature.properties.ST_NM ||
                    feature.properties.name ||
                    feature.properties.NAME ||
                    "Unknown State";


                // Popup
                layer.bindPopup(`
                    <div>
                        <strong>${stateName}</strong>
                        <br><br>
                        Region: North Eastern India
                        <br>
                        GIS Status: Active
                    </div>
                `);


                // State label
                layer.bindTooltip(
                    stateName,
                    {
                        permanent: true,
                        direction: "center",
                        className: "state-label"
                    }
                );


                // Click state
                layer.on("click", function() {

                    document.getElementById(
                        "locationInfo"
                    ).innerHTML = `
                        <strong>${stateName}</strong>
                        <br>
                        Region: North Eastern India
                        <br>
                        GIS Status: Active
                    `;

                });

            }

        });


        // ========================================
        // ADD NER BOUNDARIES
        // ========================================

        nerBoundaryLayer.addTo(map);


        // ========================================
        // AUTOMATICALLY ZOOM TO NER
        // ========================================

        if (nerBoundaryLayer.getBounds().isValid()) {

            map.fitBounds(
                nerBoundaryLayer.getBounds(),
                {
                    padding: [20, 20]
                }
            );

        }


        console.log(
            "8 NER state boundaries displayed."
        );

    })


    .catch(function(error) {

        console.error(
            "Error loading NER boundaries:",
            error
        );

    });
// ========================================
// DEMO ROAD NETWORK
// ========================================

const roads = [

    {
        name: "Guwahati - Shillong",
        coordinates: [
            [26.1445, 91.7362],
            [25.5788, 91.8933]
        ]
    },

    {
        name: "Guwahati - Tezpur",
        coordinates: [
            [26.1445, 91.7362],
            [26.6528, 92.7926]
        ]
    },

    {
        name: "Imphal - Kohima",
        coordinates: [
            [24.8170, 93.9368],
            [25.6751, 94.1086]
        ]
    },

    {
        name: "Aizawl - Agartala",
        coordinates: [
            [23.7271, 92.7176],
            [23.8315, 91.2868]
        ]
    }

];


// Demo roads hidden


roadLayer.addTo(map);


// ========================================
// LAYER CONTROLS
// ========================================

document.getElementById(
    "stateLayer"
).addEventListener("change", function(event) {

    if (event.target.checked) {

        stateLayer.addTo(map);

    } else {

        map.removeLayer(stateLayer);

    }

});


document.getElementById(
    "roadLayer"
).addEventListener("change", function(event) {

    if (event.target.checked) {

        roadLayer.addTo(map);

    } else {

        map.removeLayer(roadLayer);

    }

});


// ========================================
// MAP READY MESSAGE
// ========================================

console.log(
    "NER Smart Logistics GIS loaded successfully."
);

// ========================================
// REAL ROAD ROUTING
// OSRM ROUTING ENGINE
// ========================================

let routeLayer = null;
let alternativeRouteLayers = [];

// ML risk markers
let riskMarkers = [];

document
    .getElementById("routeButton")
    .addEventListener("click", calculateRoute);


function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {
    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}

function determineRiskType(environmental) {

    const risks = [];

    if (environmental.slope_deg >= 25) {
        risks.push("Landslide");
    }

    if (
        environmental.rainfall_24h_mm >= 100 ||
        environmental.rain_3d_mm >= 180
    ) {
        risks.push("Heavy Rainfall");
    }

    if (environmental.river_level_ratio >= 0.90) {
        risks.push("Flood / River Level");
    }

    if (environmental.historical_incidents_90d >= 5) {
        risks.push("Historical Incident Zone");
    }

    if (risks.length === 0) {
        return "Environmental Hazard";
    }

    return risks.join(" + ");
}

function calculateRouteProgressKm(coordinates, targetLat, targetLon) {

    let distanceKm = 0;
    let closestDistance = Infinity;
    let distanceAtClosestPoint = 0;

    for (let i = 1; i < coordinates.length; i++) {

        const prev = coordinates[i - 1];
        const current = coordinates[i];

        const segmentDistance = calculateDistanceKm(
            prev[1],
            prev[0],
            current[1],
            current[0]
        );

        distanceKm += segmentDistance;

        const distanceToTarget = calculateDistanceKm(
            targetLat,
            targetLon,
            current[1],
            current[0]
        );

        if (distanceToTarget < closestDistance) {

            closestDistance = distanceToTarget;
            distanceAtClosestPoint = distanceKm;
        }
    }

    return distanceAtClosestPoint;
}

function calculateRoute() {
    
    const routeRiskResults = [];

    clearRiskMarkers();
    // GET SOURCE

    const source =
        document.getElementById(
            "sourceSelect"
        ).value;


    // GET DESTINATION

    const destination =
        document.getElementById(
            "destinationSelect"
        ).value;


    // CHECK INPUT

    if (!source || !destination) {

        alert(
            "Please select source and destination."
        );

        return;
    }


    // -------------------------------
    // SOURCE COORDINATES
    // -------------------------------

    const sourceParts =
        source.split(",");

    const sourceLat =
        parseFloat(sourceParts[0]);

    const sourceLon =
        parseFloat(sourceParts[1]);


    // -------------------------------
    // DESTINATION COORDINATES
    // -------------------------------

    const destinationParts =
        destination.split(",");

    const destinationLat =
        parseFloat(destinationParts[0]);

    const destinationLon =
        parseFloat(destinationParts[1]);


    // -------------------------------
    // OSRM URL
    // -------------------------------

    const url =
        "https://router.project-osrm.org/route/v1/driving/" +
        sourceLon + "," + sourceLat +
        ";" +
        destinationLon + "," + destinationLat +
        "?overview=full&geometries=geojson&alternatives=true";


    console.log(
        "Routing URL:",
        url
    );

    function clearRiskMarkers() {

    riskMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });

    riskMarkers = [];
}


    // -------------------------------
    // SHOW LOADING
    // -------------------------------

    document.getElementById(
        "routeInfo"
    ).innerHTML =
        "Calculating route...";


    // -------------------------------
    // REQUEST ROUTE
    // -------------------------------

    fetch(url)

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "Routing server error"
                );

            }

            return response.json();

        })


        .then(function(data) {

            console.log(
                "OSRM Response:",
                data
            );


        // CHECK ROUTE

            if (data.code !== "Ok") {

                throw new Error(
                    "No route found"
                );

            }

        // ALL CANDIDATE ROUTES
            const routes = data.routes;

            console.log(
                "Candidate routes:",
                routes.length
            );

            routes.forEach(function(route, index) {
                console.log(
                    "Route " + index,
                    "distance:",
                    (route.distance / 1000).toFixed(2) + " km",
                    "duration:",
                    (route.duration / 60).toFixed(1) + " min"
                );
            });

            // Sample points along each route
routes.forEach(function(route, routeIndex) {

    const coordinates = route.geometry.coordinates;

    const sampleDistanceKm = 10;

    const sampledPoints = [];

    let lastSampledPoint = null;

    for (let i = 0; i < coordinates.length; i++) {

        const point = coordinates[i];

        const lon = point[0];
        const lat = point[1];

        if (lastSampledPoint === null) {

            sampledPoints.push({
                lon: lon,
                lat: lat
            });

            lastSampledPoint = {
                lon: lon,
                lat: lat
            };

            continue;
        }

        const distance = calculateDistanceKm(
            lastSampledPoint.lat,
            lastSampledPoint.lon,
            lat,
            lon
        );

        if (distance >= sampleDistanceKm) {

            sampledPoints.push({
                lon: lon,
                lat: lat
            });

            lastSampledPoint = {
                lon: lon,
                lat: lat
            };
        }
    }

    // Always include destination
    const lastPoint =
        coordinates[coordinates.length - 1];

    const destinationPoint = {
        lon: lastPoint[0],
        lat: lastPoint[1]
    };

    const distanceFromLastSample =
        calculateDistanceKm(
            lastSampledPoint.lat,
            lastSampledPoint.lon,
            destinationPoint.lat,
            destinationPoint.lon
        );

    if (distanceFromLastSample > 0.1) {

        sampledPoints.push(
            destinationPoint
        );
    }

    console.log(
        "Route " +
        (routeIndex + 1) +
        " prediction points:",
        sampledPoints.length
    );

    // ---------------------------------
    // Test environmental lookup
    // ---------------------------------

// ---------------------------------
// ML prediction for ALL sampled points
// ---------------------------------

const predictionPromises = sampledPoints.map(function(point) {

    const nearest = findNearestEnvironmentalPoint(
        point.lat,
        point.lon
    );

    if (!nearest) {
        return Promise.resolve(null);
    }

    const predictionInput = {
        state: nearest.state,
        nearest_river: nearest.nearest_river,
        river_danger_level_is_official:
            nearest.river_danger_level_is_official,

        rainfall_24h_mm: nearest.rainfall_24h_mm,
        rain_3d_mm: nearest.rain_3d_mm,
        rain_7d_mm: nearest.rain_7d_mm,

        slope_deg: nearest.slope_deg,

        historical_incidents_90d:
            nearest.historical_incidents_90d,

        river_danger_level_m:
            nearest.river_danger_level_m,

        present_river_level_m:
            nearest.present_river_level_m,

        river_level_ratio:
            nearest.river_level_ratio,

        month: nearest.month
    };

    return fetch(
        "http://127.0.0.1:8001/predict",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(predictionInput)
        }
    )
    .then(function(response) {

        if (!response.ok) {
            throw new Error(
                "ML API error: " + response.status
            );
        }

        return response.json();
    })
    .then(function(result) {

        return {
            point: point,
            environmental: nearest,
            prediction: result
        };

    })
    .catch(function(error) {

        console.error(
            "ML prediction error:",
            error
        );

        return null;
    });
});


Promise.all(predictionPromises)
    .then(function(results) {

        const validResults = results.filter(
            function(result) {
                return result !== null;
            }
        );

        const maxProbability = Math.max(
    ...validResults.map(function(result) {
        return result.prediction.probability;
    })
);

let riskLevel;

if (maxProbability < 0.30) {
    riskLevel = "LOW";
}
else if (maxProbability < 0.60) {
    riskLevel = "MODERATE";
}
else if (maxProbability < 0.80) {
    riskLevel = "HIGH";
}
else {
    riskLevel = "VERY HIGH";
}

console.log(
    "Route " +
    (routeIndex + 1) +
    " Maximum Risk:",
    (maxProbability * 100).toFixed(1) + "%",
    riskLevel
);

routeRiskResults.push({
    routeIndex: routeIndex,
    probability: maxProbability,
    riskLevel: riskLevel,
    distance: route.distance,
    duration: route.duration
});

        console.log(
            "Route " +
            (routeIndex + 1) +
            " ML predictions:",
            validResults
        );

        // Sort by blockage probability
        const highestRiskPoints = [...validResults]
            .sort(function(a, b) {
                return (
                    b.prediction.probability -
                    a.prediction.probability
                );
            })
            .slice(0, 6);

        console.log(
            "Route " +
            (routeIndex + 1) +
            " TOP 6 RISK POINTS:",
            highestRiskPoints
        );

highestRiskPoints.forEach(function(result, index) {

    console.log(
        "Route " +
        (routeIndex + 1) +
        " Risk Point " +
        (index + 1) +
        ":",
        result.point,
        "Blocked:",
        result.prediction.blocked,
        "Probability:",
        result.prediction.probability
    );

    // ---------------------------------
    // RISK LEVEL FOR THIS POINT
    // ---------------------------------

    const pointProbability =
        result.prediction.probability;

    let pointRiskLevel;

    if (pointProbability < 0.30) {
        pointRiskLevel = "LOW";
    }
    else if (pointProbability < 0.60) {
        pointRiskLevel = "MODERATE";
    }
    else if (pointProbability < 0.80) {
        pointRiskLevel = "HIGH";
    }
    else {
        pointRiskLevel = "VERY HIGH";
    }


    // ---------------------------------
    // ESTIMATED TIME TO RISK POINT
    // ---------------------------------

    const distanceToRisk =
        calculateRouteProgressKm(
            coordinates,
            result.point.lat,
            result.point.lon
        );

    const routeDistanceKm =
        route.distance / 1000;

    let estimatedMinutes = 0;

    if (routeDistanceKm > 0) {

        const estimatedSeconds =
            route.duration *
            (distanceToRisk / routeDistanceKm);

        estimatedMinutes =
            Math.round(
                estimatedSeconds / 60
            );
    }


    // ---------------------------------
    // RISK TYPE
    // ---------------------------------

    const riskType =
        determineRiskType(
            result.environmental
        );


    // ---------------------------------
    // CREATE MARKER
    // ---------------------------------

    let riskColor;

if (pointProbability < 0.30) {
    riskColor = "#22c55e";
}
else if (pointProbability < 0.60) {
    riskColor = "#eab308";
}
else if (pointProbability < 0.80) {
    riskColor = "#f97316";
}
else {
    riskColor = "#ef4444";
}

const riskMarker =
    L.circleMarker(
        [
            result.point.lat,
            result.point.lon
        ],
        {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: riskColor,
            fillOpacity: 0.9
        }
    );


    // ---------------------------------
    // POPUP
    // ---------------------------------

    riskMarker.bindPopup(

        "<div class='risk-popup'>" +

            "<div class='risk-popup-title'>" +
                "AI ROAD RISK ALERT" +
            "</div>" +

            "<div class='risk-popup-risk'>" +
                pointRiskLevel +
            "</div>" +

            "<div class='risk-popup-row'>" +
                "<span>Blockage Probability</span>" +
                "<strong>" +
                    (pointProbability * 100)
                        .toFixed(1) +
                    "%" +
                "</strong>" +
            "</div>" +

            "<div class='risk-popup-row'>" +
                "<span>Estimated Arrival</span>" +
                "<strong>" +
                    estimatedMinutes +
                    " min" +
                "</strong>" +
            "</div>" +

            "<div class='risk-popup-row'>" +
                "<span>Risk Type</span>" +
                "<strong>" +
                    riskType +
                "</strong>" +
            "</div>" +

            "<div class='risk-popup-row'>" +
                "<span>Route</span>" +
                "<strong>" +
                    "Route " +
                    (routeIndex + 1) +
                "</strong>" +
            "</div>" +

        "</div>"
    );


    // ---------------------------------
    // ADD TO MAP
    // ---------------------------------

    riskMarker.addTo(map);

riskMarker.openPopup();

riskMarkers.push(riskMarker);

});


// ========================================
// FINAL AI ROUTE VERDICT
// ========================================

if (routeRiskResults.length === routes.length) {

    routeRiskResults.sort(function(a, b) {

        if (a.probability !== b.probability) {
            return a.probability - b.probability;
        }

        return a.distance - b.distance;
    });

    const recommendedRoute = routeRiskResults[0];

    const recommendedProbability =
        (recommendedRoute.probability * 100).toFixed(1);

    const recommendedRisk =
        recommendedRoute.riskLevel;

    console.log(
        "AI Recommended Route:",
        recommendedRoute.routeIndex + 1
    );

    console.log(
        "AI Recommended Probability:",
        recommendedProbability + "%"
    );

    const recommendedRouteCoordinates =
    routes[recommendedRoute.routeIndex].geometry.coordinates;

const popupPoint =
    recommendedRouteCoordinates[
        Math.floor(recommendedRouteCoordinates.length / 2)
    ];

const popupLat = popupPoint[1];
const popupLon = popupPoint[0];

L.popup({
    maxWidth: 320
})
.setLatLng([popupLat, popupLon])
.setContent(
    "<strong>AI ROUTE RECOMMENDATION</strong><br><br>" +

    "Recommended Route: <strong>Route " +
    (recommendedRoute.routeIndex + 1) +
    "</strong><br>" +

    "Maximum Blockage Risk: <strong>" +
    recommendedProbability +
    "%</strong><br>" +

    "Risk Level: <strong>" +
    recommendedRisk +
    "</strong><br><br>" +

    "Selected because it has the lowest predicted " +
    "blockage risk among the available routes."
)
.openOn(map);

    const aiRouteRiskInfo =
        document.getElementById("aiRouteRiskInfo");

    aiRouteRiskInfo.innerHTML =
        "<strong>AI RECOMMENDATION</strong><br><br>" +

        "Recommended Route: <strong>Route " +
        (recommendedRoute.routeIndex + 1) +
        "</strong><br>" +

        "Maximum Blockage Risk: <strong>" +
        recommendedProbability +
        "%</strong><br>" +

        "Risk Level: <strong>" +
        recommendedRisk +
        "</strong><br>" +

        "Distance: <strong>" +
        (recommendedRoute.distance / 1000).toFixed(2) +
        " km</strong><br>" +

        "Travel Time: <strong>" +
        Math.round(recommendedRoute.duration / 60) +
        " min</strong><br><br>" +

        "Route " +
(recommendedRoute.routeIndex + 1) +
" has the lowest predicted blockage risk " +
"among the available routes.";
}
    });
});

            // FIRST ROUTE

            const route =
                data.routes[0];


            // -------------------------------
            // REMOVE OLD ROUTE
            // -------------------------------

            if (routeLayer) {

                map.removeLayer(
                    routeLayer
                );

            }

            // REMOVE OLD ALTERNATIVE ROUTES
            alternativeRouteLayers.forEach(function(layer) {
                map.removeLayer(layer);
            });

alternativeRouteLayers = [];


            // -------------------------------
            // DRAW ROUTE
            // -------------------------------

            routeLayer =
    L.geoJSON(
        route.geometry,
        {
            style: {
                color: "#22c55e",
                weight: 6,
                opacity: 0.9
            }
        }
    );


            routeLayer.addTo(map);
            // DRAW ALTERNATIVE ROUTES
            routes.slice(1).forEach(function(altRoute, index) {

    const altLayer = L.geoJSON(
        altRoute.geometry,
        {
            style: {
    color: "#a855f7",
    weight: 5,
    opacity: 0.8,
    dashArray: "10, 10"
}
        }
    );

    altLayer.addTo(map);

    alternativeRouteLayers.push(altLayer);

    console.log(
        "Displayed alternative route:",
        index + 1
    );
            });
            assessRouteRisk(routeLayer);
            checkRouteRisk(
            route.geometry.coordinates
            );


            // -------------------------------
            // ZOOM TO ROUTE
            // -------------------------------

            map.fitBounds(
                routeLayer.getBounds(),
                {
                    padding: [30, 30]
                }
            );


            // -------------------------------
            // DISTANCE
            // -------------------------------

            const distance =
                (
                    route.distance / 1000
                ).toFixed(2);


            // -------------------------------
            // TIME
            // -------------------------------

            const totalMinutes =
                Math.round(
                    route.duration / 60
                );


            const hours =
                Math.floor(
                    totalMinutes / 60
                );


            const minutes =
                totalMinutes % 60;


            let travelTime;


            if (hours > 0) {

                travelTime =
                    hours +
                    " hr " +
                    minutes +
                    " min";

            } else {

                travelTime =
                    minutes +
                    " min";

            }


            // -------------------------------
            // DISPLAY RESULT
            // -------------------------------

            let routeSummary =
                "<strong>Candidate Routes</strong><br><br>";

            routes.forEach(function(route, index) {

            const routeDistance = (route.distance / 1000).toFixed(2);
            const routeMinutes = Math.round(route.duration / 60);

              routeSummary +=
                 "<strong>Route " + (index + 1) + "</strong>" +
                 "<br>" +
                 "Distance: " + routeDistance + " km" +
                 "<br>" +
                 "Time: " + routeMinutes + " min" +
                 "<br><br>";
            });

            routeSummary +=
                "Road Network: OpenStreetMap" +
                "<br>" +
                "Routing Engine: OSRM";

            document.getElementById("routeInfo").innerHTML = routeSummary;

            console.log(
                "Distance:",
                distance,
                "km"
            );


            console.log(
                "Travel time:",
                travelTime
            );

        })


        .catch(function(error) {

            console.error(
                "Routing Error:",
                error
            );


            document.getElementById(
                "routeInfo"
            ).innerHTML =

                "<strong>Route Error</strong>" +

                "<br><br>" +

                error.message;

        });

}
// ========================================
// GPS TRACKING
// ========================================

let gpsMarker = null;

let gpsAccuracyCircle = null;

let gpsWatchId = null;


// ========================================
// START GPS
// ========================================

document
    .getElementById("startGpsButton")
    .addEventListener(
        "click",
        startGPSTracking
    );


function startGPSTracking() {

    // CHECK BROWSER SUPPORT

    if (!navigator.geolocation) {

        document.getElementById(
            "gpsInfo"
        ).innerHTML =
            "GPS is not supported by this browser.";

        return;
    }


    document.getElementById(
        "gpsInfo"
    ).innerHTML =
        "Searching for GPS location...";


    // START WATCHING LOCATION

    gpsWatchId =
        navigator.geolocation.watchPosition(

            updateGPSLocation,

            gpsError,

            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000
            }

        );

}


// ========================================
// UPDATE GPS LOCATION
// ========================================

function updateGPSLocation(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    console.log(
        "GPS:",
        latitude,
        longitude
    );


    // ====================================
    // CREATE VEHICLE MARKER
    // ====================================

    if (!gpsMarker) {

        gpsMarker =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            ).addTo(map);

        gpsMarker.bindPopup(
            "<strong>Live Vehicle Location</strong>"
        );

    }

    else {

        gpsMarker.setLatLng(
            [
                latitude,
                longitude
            ]
        );

    }


    // ====================================
    // ACCURACY CIRCLE
    // ====================================

    if (!gpsAccuracyCircle) {

        gpsAccuracyCircle =
            L.circle(
                [
                    latitude,
                    longitude
                ],
                {
                    radius: accuracy
                }
            ).addTo(map);

    }

    else {

        gpsAccuracyCircle.setLatLng(
            [
                latitude,
                longitude
            ]
        );

        gpsAccuracyCircle.setRadius(
            accuracy
        );

    }


    // ====================================
    // CENTER MAP
    // ====================================

    map.setView(
        [
            latitude,
            longitude
        ],
        15
    );


    // ====================================
    // DISPLAY GPS INFORMATION
    // ====================================

    document.getElementById(
        "gpsInfo"
    ).innerHTML =

        "<strong>GPS ACTIVE</strong>" +

        "<br><br>" +

        "Latitude: " +
        latitude.toFixed(6) +

        "<br>" +

        "Longitude: " +
        longitude.toFixed(6) +

        "<br>" +

        "Accuracy: " +
        accuracy.toFixed(1) +
        " meters";

}


// ========================================
// GPS ERROR
// ========================================

function gpsError(error) {

    console.error(
        "GPS Error:",
        error
    );


    let message;


    if (error.code === 1) {

        message =
            "Location permission denied.";

    }

    else if (error.code === 2) {

        message =
            "Location unavailable.";

    }

    else if (error.code === 3) {

        message =
            "GPS request timed out.";

    }

    else {

        message =
            "Unknown GPS error.";

    }


    document.getElementById(
        "gpsInfo"
    ).innerHTML =
        message;

}


// ========================================
// STOP GPS
// ========================================

document
    .getElementById("stopGpsButton")
    .addEventListener(
        "click",
        stopGPSTracking
    );


function stopGPSTracking() {

    if (gpsWatchId !== null) {

        navigator.geolocation.clearWatch(
            gpsWatchId
        );

        gpsWatchId = null;

    }


    document.getElementById(
        "gpsInfo"
    ).innerHTML =
        "GPS tracking stopped.";

}

// ========================================
// HAZARD INTELLIGENCE
// ========================================

let hazardLayer = null;

fetch("/data/hazard_zones.geojson")
    .then(function(response) {

        if (!response.ok) {
            throw new Error("Hazard data could not be loaded");
        }

        return response.json();
    })
    .then(function(data) {

        console.log("Hazard data loaded.");

        hazardLayer = L.geoJSON(data, {

            style: function(feature) {

                const hazard =
                    feature.properties.hazard;

                const risk =
                    feature.properties.risk;

                let fillColor;

                if (hazard === "Flood") {
    fillColor = "#06b6d4";
}
else if (hazard === "Landslide") {
    fillColor = "#f97316";
}
else {
    fillColor = "#ef4444";
}

                return {
                    color: fillColor,
                    weight: 2,
                    fillColor: fillColor,
                    fillOpacity: 0.15
                };
            },

            onEachFeature: function(feature, layer) {

                const name =
                    feature.properties.name;

                const hazard =
                    feature.properties.hazard;

                const risk =
                    feature.properties.risk;

                const score =
                    feature.properties.score;

                layer.bindPopup(
                    "<strong>" +
                    name +
                    "</strong>" +
                    "<br><br>" +
                    "Hazard: " +
                    hazard +
                    "<br>" +
                    "Risk Level: " +
                    risk +
                    "<br>" +
                    "Risk Score: " +
                    score +
                    "/100"
                );

                layer.on(
                    "click",
                    function() {

                        document.getElementById(
                            "locationInfo"
                        ).innerHTML =

                            "<strong>" +
                            name +
                            "</strong>" +
                            "<br>" +
                            "Hazard: " +
                            hazard +
                            "<br>" +
                            "Risk: " +
                            risk +
                            "<br>" +
                            "Score: " +
                            score +
                            "/100";
                            document.getElementById(
    "riskInfo"
).innerHTML =

    "<strong>Risk Assessment</strong>" +

    "<br><br>" +

    "Hazard: " +
    hazard +

    "<br>" +

    "Risk Level: " +
    risk +

    "<br>" +

    "Risk Score: " +
    score +
    "/100" +

    "<br><br>" +

    "Status: " +
    getRiskStatus(score);
    "<br><br>" +
"<strong>⚠ CAUTION: HIGH RISK AREA</strong>";
                    }
                );
            }

        });

        // hazardLayer.addTo(map);

        console.log(
            "Hazard zones displayed."
        );
    })
    .catch(function(error) {

        console.error(
            "Hazard Error:",
            error
        );
    });

    document
    .getElementById("hazardToggle")
    .addEventListener("change", function() {

        if (!hazardLayer) {
            return;
        }

        if (this.checked) {
            // hazardLayer.addTo(map);
        }
        else {
            map.removeLayer(hazardLayer);
        }
    });
    // ========================================
// RISK STATUS
// ========================================

function getRiskStatus(score) {

    if (score >= 80) {

        return "VERY HIGH RISK";

    }

    else if (score >= 60) {

        return "HIGH RISK";

    }

    else if (score >= 40) {

        return "MEDIUM RISK";

    }

    else if (score >= 20) {

        return "LOW RISK";

    }

    else {

        return "SAFE";

    }
}

// ========================================
// RISK-AWARE ROUTE ANALYSIS
// ========================================

function checkRouteRisk(routeCoordinates) {

    if (!hazardLayer) {
        return;
    }

    let highRiskDetected = false;
    let riskZones = [];

    routeCoordinates.forEach(function(point) {

        const lon = point[0];
        const lat = point[1];

        hazardLayer.eachLayer(function(layer) {

            if (!layer.getBounds) {
                return;
            }

            if (layer.getBounds().contains([lat, lon])) {

                const props = layer.feature.properties;

                if (
                    props.risk === "High" ||
                    props.risk === "Very High"
                ) {

                    highRiskDetected = true;

                    if (!riskZones.includes(props.name)) {
                        riskZones.push(props.name);
                    }
                }
            }
        });
    });


    const routeInfo =
        document.getElementById("routeInfo");


    if (highRiskDetected) {

        routeInfo.innerHTML +=

            "<br><br>" +

            "<strong>⚠️ RISK WARNING</strong>" +

            "<br><br>" +

            "Route intersects a high-risk area." +

            "<br>" +

            "Hazard Zone: " +

            riskZones.join(", ");

    }

    else {

        routeInfo.innerHTML +=

            "<br><br>" +

            "<strong>✓ SAFE ROUTE</strong>" +

            "<br>" +

            "No high-risk hazard zone detected.";

    }
}

// ========================================
// ROUTE RISK ASSESSMENT
// ========================================

function assessRouteRisk(routeLayer) {

    if (!hazardLayer) {
        console.log("Hazard layer not loaded.");
        return;
    }

    let riskZones = [];

    hazardLayer.eachLayer(function(hazard) {

        if (routeLayer.getBounds().intersects(
            hazard.getBounds()
        )) {

            const properties =
                hazard.feature.properties;

            riskZones.push({
                name: properties.name,
                hazard: properties.hazard,
                risk: properties.risk,
                score: properties.score
            });
        }
    });

    const routeInfo =
        document.getElementById("routeInfo");

    if (riskZones.length === 0) {

        routeInfo.innerHTML +=
            "<br><br>" +
            "<strong>Route Risk Assessment</strong>" +
            "<br>" +
            "✅ LOW RISK" +
            "<br>" +
            "No known hazard zones detected near the route.";

        return;
    }

    let html =
        "<br><br>" +
        "<strong>⚠ ROUTE RISK ASSESSMENT</strong>" +
        "<br><br>";

    riskZones.forEach(function(zone) {

        html +=
            "<strong>" +
            zone.name +
            "</strong>" +
            "<br>" +
            "Hazard: " +
            zone.hazard +
            "<br>" +
            "Risk: " +
            zone.risk +
            "<br>" +
            "Score: " +
            zone.score +
            "/100" +
            "<br><br>";
    });

    html +=
        "<strong>⚠ CAUTION: Route passes through/near hazard zone.</strong>";

    routeInfo.innerHTML += html;
}