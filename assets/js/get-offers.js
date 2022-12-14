// Global Variables & Constants
const urlQueryString = window.location.search;
const urlParams = new URLSearchParams(urlQueryString);
let defaultUserDislikes = [];
let defaultUserRecommendations = [];
let recommendedOffersDetailsArray = [];

let latitude = "40.700514";
let longitude = "-80.035769";

function get_user_location() {
    document.getElementById("results_cards").innerHTML = "";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showPositionError);
    } else {
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
    switch (error.code) {
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
            fetch_postRequest(url, body)
                .then(data => {
                    latitude = data.coordinates.lat;
                    longitude = data.coordinates.lng;
                    getOffers();
                })
        } catch (err) {
            console.log("Something went wrong with getting lat/lon from zip");
            console.log(err)
        }
    } else {
        alert("Precise location is not available. Please add the {?postalcode=} URL parameter and reload");
    }
}

function getOffers() {
    let url = "https://triple-proxy.grogoo.dev/search";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "text_query": document.getElementById("searchbar").value,
        "page_size": 50,
        "page_offset": 0,
        "proximity_target": {
            "radius": 35000,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude)
        },
        "apply_filter": {}
    };
    if (document.getElementById("inperson-switch").checked) {
        body.apply_filter.mode = "IN_PERSON"
    }

    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
                displayOfferCards(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}

// dedicated search function for category filters because filters might get populated after the initial query
function getOffersWithCategories() {
    document.getElementById("results_cards").innerHTML = "";
    let url = "https://triple-proxy.grogoo.dev/search";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "text_query": document.getElementById("searchbar").value,
        "page_size": 50,
        "page_offset": 0,
        "proximity_target": {
            "radius": 35000,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude)
        },
        "apply_filter": {}
    };
    //handling filters
    if (document.getElementById("inperson-switch").checked) {
        body.apply_filter.mode = "IN_PERSON"
    }
    if (document.getElementById("AUTOMOTIVE-category-radio").checked) {
        body.apply_filter.category = "AUTOMOTIVE"
    }
    if (document.getElementById("FOOD-category-radio").checked) {
        body.apply_filter.category = "FOOD"
    }
    if (document.getElementById("ENTERTAINMENT-category-radio").checked) {
        body.apply_filter.category = "ENTERTAINMENT"
    }
    if (document.getElementById("RETAIL-category-radio").checked) {
        body.apply_filter.category = "RETAIL"
    }
    if (document.getElementById("TRAVEL-category-radio").checked) {
        body.apply_filter.category = "TRAVEL"
    }
    if (document.getElementById("FINANCIAL_SERVICES-category-radio").checked) {
        body.apply_filter.category = "FINANCIAL_SERVICES"
    }
    if (document.getElementById("OFFICE_AND_BUSINESS-category-radio").checked) {
        body.apply_filter.category = "OFFICE_AND_BUSINESS"
    }
    if (document.getElementById("HOME-category-radio").checked) {
        body.apply_filter.category = "HOME"
    }
    if (document.getElementById("HEALTH_AND_BEAUTY-category-radio").checked) {
        body.apply_filter.category = "HEALTH_AND_BEAUTY"
    }
    if (document.getElementById("CHILDREN_AND_FAMILY-category-radio").checked) {
        body.apply_filter.category = "CHILDREN_AND_FAMILY"
    }
    if (document.getElementById("ELECTRONICS-category-radio").checked) {
        body.apply_filter.category = "ELECTRONICS"
    }
    if (document.getElementById("UTILITIES_AND_TELECOM-category-radio").checked) {
        body.apply_filter.category = "UTILITIES_AND_TELECOM"
    }
    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
                displayOfferCards(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}


function displayOfferCards(data) {
    let results = data.offers;
    if (results.length === 0) {
        let searchResultCard = document.createElement("div");
        searchResultCard.id = "no-offer-card";
        searchResultCard.className = "card";
        searchResultCard.style = "flex-direction: row; width: 100%; margin-top: 5px;";

        searchResultCard.innerHTML = `
        <div class="col-md-4 d-flex align-items-center" style="width: 20%">
                <i class="far fa-frown"></i>
            </div>
            <div class="col-md-8" style="width: 80%">
                <div class="card-body">
                    <h5 class="card-title" style="font-size: 0.800em; font-weight: bold">No results</h5>
                    <p class="card-text" style="font-size: 0.800em;">Make sure you expand your search by switching off the "In-Person Only" toggle</p>
                </div>
            </div></div>
        `
        let mainContainer = document.getElementById("results_cards");
        mainContainer.appendChild(searchResultCard);
    } else {
        for (let i = 0; i < results.length; i++) {
            if (defaultUserDislikes.includes(results[i].id)) {
                console.log("Skipping offer ID: " + results[i].id);
                try {
                    // -1 on the index so that we can assume/will work that we will have at least one recommendation
                    createReplacementOffer(i-1);
                }
                catch (e) {
                    console.log("Not enough recommendations available")
                }
            } else {
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
                    <a data-bs-toggle="modal" data-bs-target="#detailsModal" style="color: #55acee; margin-left: 20px; margin-top: 5px;" href="#!" role="button" onclick="getOfferDetails(` + results[i].id + `)">
                        <i class="fas fa-eye fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 40px; margin-top: 7px;" href="#!" role="button" onclick="offerLike(` + results[i].id + `)" id="likeButton-` + results[i].id + `"><i class="far fa-thumbs-up fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 15px; margin-top: 7px;" href="#!" role="button" onclick="offerDislike(` + results[i].id + `)" id="dislikeButton-` + results[i].id + `"><i class="far fa-thumbs-down fa-2x"></i></a>
                    </p> 
                </div>
            </div></div>
        `
                let mainContainer = document.getElementById("results_cards");
                mainContainer.appendChild(searchResultCard);
            }
        }
    }
}

// function to create a replacement offer based on recommendation array
function createReplacementOffer(offerIndex) {
    console.log("RECOMMENDED OFFER WITH INDEX: " + offerIndex);
    console.log("RECOMMENDED OFFER: ");
    console.log(recommendedOffersDetailsArray[offerIndex]);
    let searchResultCard = document.createElement("div");
    searchResultCard.id = "offer-" + recommendedOffersDetailsArray[offerIndex].id;
    searchResultCard.className = "card";
    searchResultCard.style = "flex-direction: row; width: 100%; margin-top: 5px;";

    searchResultCard.innerHTML = `
        <div class="col-md-4 d-flex align-items-center" style="width: 20%">
                <img src="` + recommendedOffersDetailsArray[offerIndex].merchant_logo_url + `" class="img-fluid rounded-start" style="margin-left:
                        10px; height: auto; width: 80%;" alt="offer logo">
            </div>
            <div class="col-md-8" style="width: 80%">
                <div class="card-body">
                    <h5 class="card-title" style="font-size: 0.800em; font-weight: bold">` + recommendedOffersDetailsArray[offerIndex].headline + `</h5>
                    <p class="card-text" style="font-size: 0.800em;">` + recommendedOffersDetailsArray[offerIndex].merchant_name + `</p>
                    <p class="card-text" style="font-size: 0.700em; font-weight: lighter;">` + recommendedOffersDetailsArray[offerIndex].category + `
                    <a data-bs-toggle="modal" data-bs-target="#detailsModal" style="color: #55acee; margin-left: 20px; margin-top: 5px;" href="#!" role="button" onclick="getOfferDetails(` + recommendedOffersDetailsArray[offerIndex].id + `)">
                        <i class="fas fa-eye fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 40px; margin-top: 7px;" href="#!" role="button" onclick="offerLike(` + recommendedOffersDetailsArray[offerIndex].id + `)" id="likeButton-` + recommendedOffersDetailsArray[offerIndex].id + `"><i class="far fa-thumbs-up fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 15px; margin-top: 7px;" href="#!" role="button" onclick="offerDislike(` + recommendedOffersDetailsArray[offerIndex].id + `)" id="dislikeButton-` + recommendedOffersDetailsArray[offerIndex].id + `"><i class="far fa-thumbs-down fa-2x"></i></a>
                    </p> 
                </div>
            </div></div>
        `
    let mainContainer = document.getElementById("results_cards");
    mainContainer.appendChild(searchResultCard);
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
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
                displayOfferDetails(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting offer details");
        console.log(err)
    }
}


function displayOfferDetails(data) {
    eraseModal();
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
        <div id="affiliate-button-div"></div>
        <br>
        <p style="font-size: 0.500em; font-weight: lighter">` + displayDetails.terms_and_conditions + `</p>
        </div>
    `;
    let mainContainer = document.getElementById("detailsModalBody");
    mainContainer.appendChild(detailsDiv);

    //handle affiliate link
    if (displayDetails.type === "AFFILIATE") {
        getAffiliateLink(displayDetails.id);
    }
}

function eraseModal() {
    document.getElementById("detailsModalBody").innerHTML = "";
}

function getCategories() {
    let url = "https://triple-proxy.grogoo.dev/categories";
    let body = {
        "card_account": urlParams.get("cardaccount"),
    };

    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
                getDefaultUserDislikes();
                displayOfferCategories(data);
                get_user_location();
            })
    } catch (err) {
        console.log("Something went wrong with getting offer categories");
        console.log(err)
    }
}


function displayOfferCategories(data) {
    let offerCategories = data.categories;
    for (let i = 0; i < offerCategories.length; i++) {
        let categoryDiv = document.createElement("div");
        categoryDiv.id = "category-" + offerCategories[i].category + "-filter";
        categoryDiv.className = "form-check"

        categoryDiv.innerHTML = `
        <input class="form-check-input" type="radio" name="flexRadioDefault" id="` + offerCategories[i].category + `-category-radio"/>
        <label class="form-check-label" for="automotive-category-radio" style="font-size: 0.800em;">` + offerCategories[i].category + `</label>
        </div>
    `;
        let mainContainer = document.getElementById("categories_radio_buttons");
        mainContainer.appendChild(categoryDiv);
    }
}

// Get an affiliate link if the offer type warrants it
function getAffiliateLink(offerid) {
    let url = "https://triple-proxy.grogoo.dev/affiliate";
    let body = {
        "card_account_external_id": urlParams.get("cardaccount-external"),
        "card_program_external_id": urlParams.get("cardprogram-external"),
        "offer_id": offerid
    };

    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
                createAffiliateButton(data)
            })
    } catch (err) {
        console.log("Something went wrong with getting an affiliate link");
        console.log(err)
    }
}


function createAffiliateButton(data) {
    //create the button
    let affiliateButton = document.createElement("button");
    affiliateButton.id = "affiliate-button";
    affiliateButton.className = "btn-sm btn-secondary";
    affiliateButton.style = "margin-bottom: 5px;";
    affiliateButton.innerHTML = `
        <a href="` + data.url + `" target="_blank" rel="noopener noreferrer"> 
            <i class="fas fa-credit-card fa-2x"></i></a>
    `
    let buttonContainer = document.getElementById("affiliate-button-div");
    buttonContainer.appendChild(affiliateButton);
}

// Handling thumbs-up thumbs-down toggle. Should be replaced by a radio-button type of control
function offerLike(offerId) {
    if (document.getElementById("likeButton-" + offerId).innerHTML === `<i class="far fa-thumbs-up fa-2x"></i>`) {
        document.getElementById("likeButton-" + offerId).innerHTML = `<i class="fas fa-thumbs-up fa-2x"></i>`;
        getUserPreferencesLike(offerId);
    } else {
        document.getElementById("likeButton-" + offerId).innerHTML = `<i class="far fa-thumbs-up fa-2x"></i>`
    }
}

function offerDislike(offerId) {
    if (document.getElementById("dislikeButton-" + offerId).innerHTML === `<i class="far fa-thumbs-down fa-2x"></i>`) {
        document.getElementById("dislikeButton-" + offerId).innerHTML = `<i class="fas fa-thumbs-down fa-2x"></i>`;
        getUserPreferencesDislike(offerId);
    } else {
        document.getElementById("dislikeButton-" + offerId).innerHTML = `<i class="far fa-thumbs-down fa-2x"></i>`
    }
}

// Before we can update a user preference like or dislike, we need the current values so we can push to the array and resubmit
function getUserPreferencesLike(offerId) {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let card_account = urlParams.get("cardaccount");
    url = url + "?card_account=" + card_account;

    try {
        fetch_GetRequest(url)
            .then(data => {
                console.log(data);
                recordUserLike(offerId, card_account, data)
            })
    } catch (err) {
        console.log("Something went wrong with getting the user preferences");
        console.log(err)
    }
}

function getUserPreferencesDislike(offerId) {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let card_account = urlParams.get("cardaccount");
    url = url + "?card_account=" + card_account;

    try {
        fetch_GetRequest(url)
            .then(data => {
                console.log(data);
                recordUserDislike(offerId, card_account, data)
            })
    } catch (err) {
        console.log("Something went wrong with getting the user preferences");
        console.log(err)
    }
}

// Record a user like or thumb-up into the user preferences database
function recordUserLike(offerId, cardAccount, data) {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let userLikes = data.liked_offers;
    userLikes.push(offerId.toString());
    const currentDate = new Date(Date.now());
    let isoDate = currentDate.toISOString();
    let body = {
        "card_account": cardAccount,
        "last_updated": isoDate,
        "liked_offers": userLikes
    };

    try {
        fetch_putRequest(url, body)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting an affiliate link");
        console.log(err)
    }
}

// Record a user disklike or thumb-down into the user preferences database
function recordUserDislike(offerId, cardAccount, data) {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let userDislikes = data.disliked_offers;
    userDislikes.push(offerId.toString());
    const currentDate = new Date(Date.now());
    let isoDate = currentDate.toISOString();
    let body = {
        "card_account": cardAccount,
        "last_updated": isoDate,
        "disliked_offers": userDislikes
    };

    try {
        fetch_putRequest(url, body)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting an affiliate link");
        console.log(err)
    }
}

// Get the disklikes as we load the page so that we can remove/pop out offers before displaying them
function getDefaultUserDislikes() {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let card_account = urlParams.get("cardaccount");
    url = url + "?card_account=" + card_account;

    try {
        fetch_GetRequest(url)
            .then(data => {
                console.log(data);
                defaultUserDislikes = data.disliked_offers;
                // Get the calculated recommended offer IDs as we load the page so that we can substitute the dislikes for this
                defaultUserRecommendations = data.recommended_offers;
                getRecommendedOfferDetails();
            })
    } catch (err) {
        console.log("Something went wrong with getting the user preferences");
        console.log(err)
    }
}

// Get the details for each recommended offer
function getRecommendedOfferDetails() {
    for (let i = 0; i < defaultUserRecommendations.length; i++) {
        let url = "https://triple-proxy.grogoo.dev/details";
        let body = {
            "card_account": urlParams.get("cardaccount"),
            "offer_id": defaultUserRecommendations[i],
            "proximity_target": {
                "radius": 35000,
                "latitude": parseFloat(latitude),
                "longitude": parseFloat(longitude)
            }
        };

        try {
            fetch_postRequest(url, body)
                .then(data => {
                    console.log(data);
                    recommendedOffersDetails(data);
                })
        } catch (err) {
            console.log("Something went wrong with getting offer details");
            console.log(err)
        }
    }
}

// Record the details in an array of JSON
function recommendedOffersDetails(data) {
    //console.log("REC OFFERS");
    //console.log(data);
    let recOffer = {
        "id": data.offer.id,
        "headline": data.offer.headline,
        "merchant_name": data.offer.merchant_name,
        "merchant_logo_url": data.offer.merchant_logo_url,
        "category": data.offer.category
    };
    recommendedOffersDetailsArray.push(recOffer);
    //console.log("RECOMMENDED OFFERS ARRAY DETAILS");
    //console.log(recommendedOffersDetailsArray);
}


function resetUserPreferences() {
    let url = "https://triple-proxy.grogoo.dev/reset-preferences";
    let card_account = urlParams.get("cardaccount");
    let body = {
        "card_account": card_account
    }
    try {
        fetch_postRequest(url)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with resetting the user preferences");
        console.log(err)
    }
}

//******** SHARED FETCH POST FUNCTION ********
async function fetch_postRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        return response.json()
    } catch (err) {
        console.log("Something went wrong with the fetch");
        console.log(err)
    }
}

//***************************************

//******** SHARED FETCH GET FUNCTION ********
async function fetch_GetRequest(url, params) {
    try {
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
        });
        return response.json()
    } catch (err) {
        console.log("Something went wrong with the fetch");
        console.log(err)
    }
}

//********  ********

//******** SHARED FETCH PUT FUNCTION ********
async function fetch_putRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        return response.json()
    } catch (err) {
        console.log("Something went wrong with the fetch");
        console.log(err)
    }
}

//***************************************