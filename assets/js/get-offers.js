// Global Variables & Constants
const urlQueryString = window.location.search;
const urlParams = new URLSearchParams(urlQueryString);

let latitude = "40.700514";
let longitude = "-80.035769";

function get_user_location() {
    document.getElementById("results_cards").innerHTML="";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showPositionError);
    }
    else {
        alert("Geolocation is not supported")
    }
}

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("My Coordinates: " + latitude + "," + longitude);
    getOffers(latitude, longitude);
}

function showPositionError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            getGeoCode();
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            getGeoCode();
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            getGeoCode();
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            getGeoCode();
            break;
    }
}

function getGeoCode() {
    if (urlParams.get("postalcode")) {
        console.log("we are going to get lat/lon");
        let url = "https://triple-proxy.grogoo.dev/geo";
        let body = {
            "postal_code": urlParams.get("postalcode"),
            "country_code": urlParams.get("countrycode")
        };

        try {
            fetch_getGeoCode(url, body)
                .then(data => {
                    latitude = data.coordinates.lat;
                    longitude = data.coordinates.lng;
                    getOffers();
                })
        }
        catch (err) {
            console.log("Something went wrong with getting lat/lon from zip");
            console.log(err)
        }
    }
    else {
        alert("Precise location is not available. Please add the {?postalcode=} URL parameter and reload");
    }
}

async function fetch_getGeoCode(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        return response.json()
    }
    catch (err) {
        console.log("Something went wrong with getting lat/lon from zip");
        console.log(err)
    }
}

function getOffers() {
    let url = "https://triple-proxy.grogoo.dev/search";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "text_query": document.getElementById("searchbar").value,
        "page_size": 25,
        "page_offset": 0,
        "proximity_target": {
            "radius": 35000,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude)
        },
        "apply_filter":{}
    };
    let inpersonSwitch = document.getElementById("inperson-switch");
    if (inpersonSwitch.checked) {
        body.apply_filter.mode = "IN_PERSON"
    }

    try {
        fetch_getOffers(url, body)
            .then(data => {
                console.log(data);
                displayOfferCards(data);
            })
    }
    catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}

async function fetch_getOffers(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        return response.json()
    }
    catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}

function displayOfferCards(data) {
    let results = data.offers;
    for (let i=0; i<results.length; i++) {
        let searchResultCard = document.createElement("div");
        searchResultCard.id = "offer-" + results[i].id;
        searchResultCard.className = "card";
        searchResultCard.style = "flex-direction: row; width: 100%; margin-top: 5px;";

        searchResultCard.innerHTML = `
        <div class="col-md-4 d-flex align-items-center" style="width: 20%">
                <img src="` + results[i].merchant_logo_url + `" class="img-fluid rounded-start" style="margin-left:
                        10px; height: auto; width: 80%;" alt="offer logo">
            </div>
            <div class="col-md-8" style="width: 80%">
                <div class="card-body">
                    <h5 class="card-title" style="font-size: 0.800em; font-weight: bold">` + results[i].headline + `</h5>
                    <p class="card-text" style="font-size: 0.800em;">` + results[i].merchant_name + `</p>
                    <p class="card-text" style="font-size: 0.700em; font-weight: lighter;">` + results[i].category + `
                    <a data-bs-toggle="modal" data-bs-target="#detailsModal" style="color: #55acee; margin-left: 20px; margin-top: 5px;" href="#!" role="button" onclick="getOfferDetails(` + results[i].id +`)">
                        <i class="fas fa-eye"></i>
                    </a></p>
                </div>
            </div></div>
        `
        let mainContainer = document.getElementById("results_cards");
        mainContainer.appendChild(searchResultCard);
    }
}

function getOfferDetails(offerid) {
    let url = "https://triple-proxy.grogoo.dev/details";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "offer_id": offerid,
        "proximity_target": {
            "radius": 35000,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude)
        }
    };

    try {
        fetch_getOfferDetails(url, body)
            .then(data => {
                console.log(data);
                displayOfferDetails(data);
            })
    }
    catch (err) {
        console.log("Something went wrong with getting offer details");
        console.log(err)
    }
}

async function fetch_getOfferDetails(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        return response.json()
    }
    catch (err) {
        console.log("Something went wrong with getting offer details");
        console.log(err)
    }
}

function displayOfferDetails(data) {
    let displayDetails = data.offer;
    let detailsDiv = document.createElement("div");
    detailsDiv.id = "offer-" + displayDetails.id;
    detailsDiv.style = "font-size: 0.800em; text-align: center;";

    detailsDiv.innerHTML = `
        <img src="` + displayDetails.merchant_logo_url + `" class="img-fluid rounded-start" style="margin-left:
                        10px; height: auto; width: 50%;" alt="offer logo">
        <p style="font-weight: bold">` + displayDetails.merchant_name + `</p>
        <p style="color: dodgerblue">` + displayDetails.headline + `</p>
        <p>` + displayDetails.description + `</p>
        <br>
        <br>
        <p style="font-size: 0.500em; font-weight: lighter">` + displayDetails.terms_and_conditions + `</p>
        </div>
    `;
    let mainContainer = document.getElementById("detailsModalBody");
    mainContainer.appendChild(detailsDiv);
}

function eraseModal() {
    document.getElementById("detailsModalBody").innerHTML="";
}