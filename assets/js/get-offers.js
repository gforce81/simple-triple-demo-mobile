// Global Variables & Constants
const urlQueryString = window.location.search;
const urlParams = new URLSearchParams(urlQueryString);
let defaultUserDislikes = [];
let defaultUserRecommendations = [];
let recommendedOffersDetailsArray = [];
let searchOffset = 0;
let searchPageSize = 25;
let queryType = "default"; //used to decide if the more results functions calls the classic search or filtered on categories
let searchTotalHits = 0; //used to decide if we can request more results
let currentCategory = "ALL"; //used to clear the offer display container if a user is simply changing category and not query

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
    getOffers();
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
    queryType = "default";
    let url = "https://triple-proxy.grogoo.dev/search";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "text_query": document.getElementById("searchbar").value,
        "page_size": searchPageSize,
        "page_offset": searchOffset,
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
                console.log("GET_OFFERS RESULTS");
                console.log("##################");
                console.log(data);
                displayOfferCards(data);
                searchTotalHits = data.total;
                if (searchPageSize >= searchTotalHits) {
                    disable_getMoreOffersButton()
                }
            })
    } catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}

// dedicated search function for category filters because filters might get populated after the initial query
function getOffersWithCategories() {
    queryType = "categories";
    enable_getMoreOffersButton();
    // we do this to avoid erasing the search results if we are just requesting more offers filtered on a category
    if (searchOffset === 0) {
        document.getElementById("results_cards").innerHTML = "";
    }
    let url = "https://triple-proxy.grogoo.dev/search";
    let body = {
        "card_account": urlParams.get("cardaccount"),
        "text_query": document.getElementById("searchbar").value,
        "page_size": searchPageSize,
        "page_offset": searchOffset,
        "proximity_target": {
            "radius": 35000,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude)
        },
        "apply_filter": {}
    };
    //handling filters
    if (document.getElementById("all-category-filters").checked) {
        console.log("Not filtering on a category");
        let thisCategory = "ALL";
        //doing all of this so that the results are cleared if the user changes just the category
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("inperson-switch").checked) {
        body.apply_filter.mode = "IN_PERSON";
        let thisCategory = "IN_PERSON";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("AUTOMOTIVE-category-radio").checked) {
        body.apply_filter.category = "AUTOMOTIVE";
        let thisCategory = "AUTOMOTIVE";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("FOOD-category-radio").checked) {
        body.apply_filter.category = "FOOD";
        let thisCategory = "FOOD";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("ENTERTAINMENT-category-radio").checked) {
        body.apply_filter.category = "ENTERTAINMENT";
        let thisCategory = "ENTERTAINMENT";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("RETAIL-category-radio").checked) {
        body.apply_filter.category = "RETAIL";
        let thisCategory = "RETAIL";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("TRAVEL-category-radio").checked) {
        body.apply_filter.category = "TRAVEL";
        let thisCategory = "TRAVEL";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("FINANCIAL_SERVICES-category-radio").checked) {
        body.apply_filter.category = "FINANCIAL_SERVICES";
        let thisCategory = "FINANCIAL_SERVICES";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("OFFICE_AND_BUSINESS-category-radio").checked) {
        body.apply_filter.category = "OFFICE_AND_BUSINESS";
        let thisCategory = "OFFICE_AND_BUSINESS";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("HOME-category-radio").checked) {
        body.apply_filter.category = "HOME";
        let thisCategory = "HOME";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("HEALTH_AND_BEAUTY-category-radio").checked) {
        body.apply_filter.category = "HEALTH_AND_BEAUTY";
        let thisCategory = "HEALTH_AND_BEAUTY";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("CHILDREN_AND_FAMILY-category-radio").checked) {
        body.apply_filter.category = "CHILDREN_AND_FAMILY";
        let thisCategory = "CHILDREN_AND_FAMILY";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("ELECTRONICS-category-radio").checked) {
        body.apply_filter.category = "ELECTRONICS";
        let thisCategory = "ELECTRONICS";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    if (document.getElementById("UTILITIES_AND_TELECOM-category-radio").checked) {
        body.apply_filter.category = "UTILITIES_AND_TELECOM";
        let thisCategory = "UTILITIES_AND_TELECOM";
        if (currentCategory !== thisCategory) {
            document.getElementById("results_cards").innerHTML = "";
        }
        currentCategory = thisCategory;
    }
    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log("GET_OFFERSWITHCATEGORIES RESULTS");
                console.log("################################");
                console.log(data);
                displayOfferCards(data);
                searchTotalHits = data.total;
                if (searchPageSize >= searchTotalHits) {
                    disable_getMoreOffersButton()
                }
            })
    } catch (err) {
        console.log("Something went wrong with getting offers");
        console.log(err)
    }
}

function getMoreOffers() {
    if (searchOffset <= searchTotalHits - searchPageSize) {
        if (queryType === "default") {
            searchOffset = searchOffset + 25;
            getOffers();
        }
        else {
            searchOffset = searchOffset + 25;
            getOffersWithCategories();
        }
    }
    else {
        disable_getMoreOffersButton()
    }
}

function disable_getMoreOffersButton() {
    document.getElementById("more-offer-cell").innerHTML = "";
    document.getElementById("more-offer-cell").innerHTML =
        `<button type="button" class="btn btn-info btn-sm" disabled id="more-offers-button" style="margin-top: 10px;" onClick="">No More
                Offers</button>`;
}

function enable_getMoreOffersButton() {
    document.getElementById("more-offer-cell").innerHTML = "";
    document.getElementById("more-offer-cell").innerHTML =
        `<button type="button" class="btn btn-info btn-sm" style="margin-top: 10px;" id="more-offers-button" onclick="getMoreOffers()">More Offers</button>`;
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
            // checking if the offer is part of the dislikes. If yes, replacing it with a recommendation
            // we can randomize in the array of recommendations
            if (defaultUserDislikes.includes(results[i].id)) {
                console.log("Skipping disliked offer ID: " + results[i].id);
                try {
                    //randomize the offer we pick in our available recommended offers details
                    const randomOfferDetails = Math.floor(Math.random() * recommendedOffersDetailsArray.length);
                    //directly sending the content of details object, not an index
                    createReplacementOffer(recommendedOffersDetailsArray[randomOfferDetails]);
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
function createReplacementOffer(offerDetails) {
    console.log("RECOMMENDED OFFER: ");
    console.log(offerDetails);
    let searchResultCard = document.createElement("div");
    searchResultCard.id = "offer-" + offerDetails.id;
    searchResultCard.className = "card";
    searchResultCard.style = "flex-direction: row; width: 100%; margin-top: 5px;";

    searchResultCard.innerHTML = `
        <div class="col-md-4 d-flex align-items-center" style="width: 20%">
                <img src="` + offerDetails.merchant_logo_url + `" class="img-fluid rounded-start" style="margin-left:
                        10px; height: auto; width: 80%;" alt="offer logo">
            </div>
            <div class="col-md-8" style="width: 80%">
                <div class="card-body">
                    <h5 class="card-title" style="font-size: 0.800em; font-weight: bold">` + offerDetails.headline + `</h5>
                    <p class="card-text" style="font-size: 0.800em;">` + offerDetails.merchant_name + `</p>
                    <p class="card-text" style="font-size: 0.700em; font-weight: lighter;">` + offerDetails.category + `
                    <a data-bs-toggle="modal" data-bs-target="#detailsModal" style="color: #55acee; margin-left: 20px; margin-top: 5px;" href="#!" role="button" onclick="getOfferDetails(` + offerDetails.id + `)">
                        <i class="fas fa-eye fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 40px; margin-top: 7px;" href="#!" role="button" onclick="offerLike(` + offerDetails.id + `)" id="likeButton-` + offerDetails.id + `"><i class="far fa-thumbs-up fa-2x"></i></a>
                        <a data-bs-toggle="modal" data-bs-target="#" style="color: #55acee; margin-left: 15px; margin-top: 7px;" href="#!" role="button" onclick="offerDislike(` + offerDetails.id + `)" id="dislikeButton-` + offerDetails.id + `"><i class="far fa-thumbs-down fa-2x"></i></a>
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
                console.log("GET_OFFERSDETAILS");
                console.log("##################");
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
                console.log("GET_CATEGORIES");
                console.log("##################");
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
                console.log("GET_AFFILIATE LINK");
                console.log("##################");
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
                getRecommendedOfferDetails(defaultUserDislikes.length);
            })
    } catch (err) {
        console.log("Something went wrong with getting the user preferences");
        console.log(err)
    }
}

// Get the details for each recommended offer
function getRecommendedOfferDetails(recsNeeded) {
    for (let i = 0; i < recsNeeded + 2; i++) {
        // Since we always have more recommendations than truly disliked offers, we can limit to only loading what we need
        // Since we want to gamify a bit, we can randomize the selected recommendations

        const randomRecId = Math.floor(Math.random() * defaultUserRecommendations.length);
        console.log("RANDOMIZED REC ID");
        console.log("#################");
        console.log(defaultUserRecommendations[randomRecId]);
        let url = "https://triple-proxy.grogoo.dev/details";
        let body = {
            "card_account": urlParams.get("cardaccount"),
            "offer_id": defaultUserRecommendations[randomRecId],
            "proximity_target": {
                "radius": 35000,
                "latitude": parseFloat(latitude),
                "longitude": parseFloat(longitude)
            }
        };

        try {
            fetch_postRequest(url, body)
                .then(data => {
                    console.log("GET_RECOMMENDED OFFERS DETAILS")
                    console.log("#############################")
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
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with resetting the user preferences");
        console.log(err)
    }
}

function calculateUserRecommendations() {
    let url = "https://triple-proxy.grogoo.dev/recommendations";
    let card_account = urlParams.get("cardaccount");
    let body = {
        "card_account": card_account
    }
    try {
        fetch_postRequest(url, body)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with calculating recommendations");
        console.log(err)
    }
}

function getUserOffersPreferences() {
    let url = "https://triple-proxy.grogoo.dev/user-preferences";
    let card_account = urlParams.get("cardaccount");
    url = url + "?card_account=" + card_account;

    try {
        fetch_GetRequest(url)
            .then(data => {
                console.log(data);
            })
    } catch (err) {
        console.log("Something went wrong with getting the user preferences");
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
async function fetch_GetRequest(url) {
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