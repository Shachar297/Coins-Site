// --- Selectors --->
let container = $("#container");

// global scoped variables for later usage ->
let favoriteCoinsToggelers = [];
let parentsArray = new Array();
let togglersArray = [];
let coinMap = new Map();
let cardsMap = new Map();
let cacheCoinForMoreInfo = new Map();
let mapForChartData = new Map();
let coinExtendedInfo;
setExampleForSearch();

// getFromLocalStorage();
// <-> start -->
function getAllCoins() {
    $.get("https://api.coingecko.com/api/v3/coins").then(function (data) {

        for (let i = 0; i < data.length; i++) {

            let currentCoin = {
                name: data[i].name,
                id: data[i].id,
                symbol: data[i].symbol,
                photo: data[i].image.small,
                amount: data[i].market_data.current_price.usd
            };
            coinMap.set(data[i].id, currentCoin);

            let currencyForChart = {
                id: data[i].id,
                amount: data[i].market_data.current_price.usd,
                price_change_1y: data[i].market_data.price_change_percentage_1y_in_currency.usd,
                price_change_200d: data[i].market_data.price_change_percentage_200d_in_currency.usd,
                price_change_60d: data[i].market_data.price_change_percentage_60d_in_currency.usd,
                price_change_30d: data[i].market_data.price_change_percentage_30d_in_currency.usd,
            }

            mapForChartData.set(data[i].id, currencyForChart);

            displayCoinsOnDOM(currentCoin);
        }
    })
}

function displayCoinsOnDOM(currentCoin) {

    let card = $("<div>").attr("id", currentCoin.symbol).addClass("card col-12");

    let h3 = $("<h3>").html(currentCoin.name);
    let cardHead = $("<div>").addClass("card-header").append(h3);

    let img = $("<img>").attr("src", currentCoin.photo);
    $(cardHead).append(h3, img);
    //
    let p = $("<p>").html(currentCoin.symbol);
    let cardBody = $("<div>").addClass("card-body").attr("id", currentCoin.id).append(p);
    //
    let cardTitle = $("<div>").attr("class", "card-title")
    let hideButton = $("<button>").html("Hide").addClass("hideBtn");
    let button = $("<button>").html("More Info").addClass("moreInfoBtn").click(function (e) {
        onMoreInfoButtonClick(currentCoin.id, cardTitle)
        $(button).replaceWith(hideButton);
    })
    // --> create toggler
    let label = createToggleSwitchToCard().label;
    let toggeller = createToggleSwitchToCard().toggeller;
    togglersArray.push(toggeller);
    let span = createToggleSwitchToCard().span;
    $(label).append(toggeller, span);
    //
    let cardFooter = $("<div>").attr("class", "card-footer").append(button, label);
    $(card).append(cardHead, cardBody, cardFooter, cardTitle);
    $(container).append(card);
    // --> set map contains actual cards in it.
    cardsMap.set(currentCoin.symbol, card);
    displayCheckedFromLocalStorage(currentCoin.symbol, toggeller)

}
//-> create toggller
function createToggleSwitchToCard() {

    let label = $("<label>");
    $(label).attr("class", "switch");

    let toggeller = $("<input>");
    $(toggeller).attr("type", "checkbox");

    let span = $("<span>");
    $(span).attr("class", "slider round");

    $(toggeller).click(() => {
        showModelWhenToggelerIsAboveFive(toggeller)
    })

    return {
        label: label,
        toggeller: toggeller,
        span: span
    };
}
//-> hande more info BTN
function onMoreInfoButtonClick(coinId, cardTitle) {
    let cardBody = $(cardTitle).parent().children()[1];
    console.log(cardBody)
    // ---- >
    if (cacheCoinForMoreInfo.has(coinId)) {
        showCoinsInRealMoney(cardTitle);

    } else {
        let loadingGif = $("<img>").attr("src", "./images/loading-gif.gif").attr("class", "loading");

        $(cardBody).append(loadingGif);

        $.get("https://api.coingecko.com/api/v3/coins/" + coinId).then(
            function (coin) {
                $(loadingGif).remove();

                coinExtendedInfo = {
                    id: coinId,
                    ils: coin.market_data.current_price.ils,
                    eur: coin.market_data.current_price.eur,
                    usd: coin.market_data.current_price.usd
                };
                // putCommaInNumber(coinExtendedInfo);
                showCoinsInRealMoney(cardTitle);
                saveCoinInCache(coinExtendedInfo);

            })
    }
}
//-> display coin in real money
function showCoinsInRealMoney(cardTitle) {

    let coinInDollarInfo = $("<h3>").html(coinExtendedInfo.usd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "  <i class=\"fas fa-dollar-sign\"></i>");
    let coinInEuroInfo = $("<h3>").html(coinExtendedInfo.eur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "  <i class=\"fas fa-euro-sign\"></i>");
    let coinInIlsInfo = $("<h3>").html(coinExtendedInfo.ils.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "  <i class=\"fas fa-shekel-sign\"></i>");
    let card = $(cardTitle).parent();
    let cardFooter = $(card).children()[2];
    console.log(cardFooter)
    $(cardTitle).append(coinInDollarInfo, coinInIlsInfo, coinInEuroInfo);

    $(cardFooter).css({
        "top": "200px",
        "left": "0"
    })
    $(card).animate({
        "height": "450px",
        "width": "350px"
    })
    let button = $(cardFooter).find("button");
    let hideButton = $("<button>").html("Hide").addClass("hide").css("right", "150px")
    $(button).replaceWith(hideButton);
    $(hideButton).click(() => {
        closeMoreInfo(card, hideButton, cardTitle, cardFooter)
    })
    console.log(button, hideButton)
}
console.log(cardsMap)
// handle Hide BTN
function closeMoreInfo(card, hideButton, cardTitle, cardFooter) {

    let button = $("<button>").html("More Info").addClass("infoBtn").css({
        "right": "150px"
    });

    $(hideButton).replaceWith(button);
    // let cardFooter = $(button).parent();
    $(cardFooter).animate({
        "top": "-6px"
    });

    $(card).animate({
        "height": "250px",
        "width": "250px"
    });
    $(button).click(() => {

        showCoinsInRealMoney(cardTitle, cardFooter, hideButton)

    })
    $(cardFooter).append(button)
    $(cardTitle).empty();
}
// -> save coin in cache, remove after 2 mins
function saveCoinInCache() {
    cacheCoinForMoreInfo.set(coinExtendedInfo.id, coinExtendedInfo);
    setTimeout(function () {
        cacheCoinForMoreInfo.delete(coinExtendedInfo.id);
    }, 120000);
}
//handle search ->
function onClickSearchCoin() {
    try {
        clearSearchCreateCoins();
        displayWhenSearchFailed()
    } catch (e) {
        showErrors(e);
        console.error(e);
    }

    searchFromSymbol();
    $("#searchInput").val("");
}
//-> when searching by symbol of the coin
function searchFromSymbol() {
    let searchInput = $("#searchInput").val().toLowerCase().trim()
    for (let i of cardsMap) {

        if (cardsMap.keys(searchInput)) {
            $(container).empty();
            $(container).append(cardsMap.get(searchInput));

            let card = cardsMap.get(searchInput);
            let cardFooter = $(card).children()[2];
            let button = $(cardFooter).find("button");
            let cardTitle = $(card).children()[3];
            let cardBody = $(card).children()[1];

            $(button).click(() => {
                onMoreInfoButtonClick($(cardBody).attr("id"), cardTitle)
            });
            let hideBtn = $("<button>").html("Hide").click(() => {
                closeMoreInfo()
            });
            break;
        }

    }
}
// show errors when needed
function showErrors(e) {
    $("#searchInput").css({
        "border-color": "red",
        "position": "relative",
        "right": "30px",
        "font-size": "30px"
    })
    $("#errorsP").html(e);
}
// iinit errors if apear
function inits() {
    $("#searchInput").css({
        "border": "none",
        "right": "0",
        "font-size": "20px"
    });
    $("#errorsP").html("");
}

function clearSearchCreateCoins() {

    if ($("#searchInput").val() == "") {
        $(".container").empty();
        getAllCoins();
    }
}

function displayWhenSearchFailed() {
    let searchInput = $("#searchInput").val().toLowerCase().trim();
    for (let i of cardsMap) {
        if (!cardsMap.keys(searchInput)) {
            $(container).empty();
            let errors = $("<h2>").html("Cannot find coin...");
            let button = $("<button>").html("Home").click(() => {
                getAllCoins();
            })
            $(container).append(errors, button)
            break;
        }
    }

}

// input FOCUSED text change, OUT-OF-FOCUS, text changes back
function setExampleForSearch() {

    $("#searchInput").focus(function () {
        $(this).attr("placeholder", "Example : btc");
    })
    $("#searchInput").on("focusout", function () {
        $(this).removeAttr();
        $(this).attr("placeholder", "Search For Coins...");
    })
}
//-> local storage
function saveFavoriteCoinsInLocalStorage(toggeller) {
    let string = localStorage.getItem("toggellers");
    let arrayForLocalStorage = [];

    if (string == null) {

        arrayForLocalStorage = $(toggeller).attr("class");
    }
    // arrayForLocalStorage.push($(toggeller).attr("class"));
    localStorage.setItem(arrayForLocalStorage, arrayForLocalStorage);
}

function displayCheckedFromLocalStorage(coinSymbol, toggeller) {
    let parent = $(toggeller).parent().parent().parent();
    if (localStorage.getItem(coinSymbol) == null) {

        return false;
    }
    $(toggeller).attr("class", coinSymbol).prop("checked", "true");
    favoriteCoinsToggelers.push(toggeller);
    parentsArray.push(parent)

    return true;
}

function removeFromLocalStorage(toggellerClass) {
    localStorage.removeItem(toggellerClass);
}
// End of search area<---> handle Modal Entrance ->
function showModelWhenToggelerIsAboveFive(toggeller) {
    let toggellerClass = $(toggeller).attr("class");
    let parent = $(toggeller).parent().parent().parent();
    let cardBody = $(parent).children()[1]
    $(toggeller).attr("class", $(parent).attr("id"));
    // <-> 
    if ($(toggeller).prop("checked") && !checkIfToggellerApears(toggeller)) {
        favoriteCoinsToggelers.push(toggeller);
        parentsArray.push($(parent));

        saveFavoriteCoinsInLocalStorage(toggeller);

    } else {
        removeElementWhileToggellerNotChecked();
        removeFromLocalStorage(toggellerClass);
    }
    handleModalOpenance(toggeller);
    // -> clean array from empty index(s)
    favoriteCoinsToggelers = favoriteCoinsToggelers.filter(function (e) {
        return e
    });
    if (parentsArray.length == 6) {
        cloneElementIntoModal();
    }
    validateToggellers();
}

function cloneElementIntoModal() {
    for (let i = 0; i < parentsArray.length; i++) {
        $("#modal-content").append(parentsArray[i].clone(false));
    }
}

function removeElementWhileToggellerNotChecked() {
    for (let i = 0; i < favoriteCoinsToggelers.length; i++) {
        if (!favoriteCoinsToggelers[i].prop("checked")) {

            favoriteCoinsToggelers.splice(i, 1);
            parentsArray.splice(i, 1);
            break;
        }
    }
}

function handleModalOpenance() {
    if (favoriteCoinsToggelers.length == 6) {
        openModal();
        removeElementWhileToggellerNotChecked();
    }
}

function openModal() {
    $("#modal").css("display", "inline-block")
    $(".nav").css("pointer-events", "none")
    $("body").css("overflow-y", "scroll");
    $(container).css("pointer-events", "none")

    $("#closeModal").click(() => {
        closeModal();
        $("#modal-content").empty();

    })
}

function closeModal() {
    $("#modal").css("display", "none")
    $("body").css("overflow-y", "scroll");
    $(".nav").css("pointer-events", "auto")
    $(container).css("pointer-events", "auto")
    saveChangesOnToggellerFromModal();

}

function disableBodyWhenModalOpen() {
    $('body').click(function (evt) {

        //all elements except the modal and elements in the modal
        if ($(evt.target).hasClass("modal") || $(evt.target).closest(".moremodal").length > 0) {

            //if there is a visible model do nothing
            if ($(".modal").is(":visible")) {
                return false;
            }
        }
    });
}

function saveChangesOnToggellerFromModal() {

    let toggeller = $("#modal").find("input");
    for (let i = 0; i < toggeller.length; i++) {
        if (!$(toggeller[i]).prop("checked")) {

            let originalParent = cardsMap.get($(toggeller[i]).attr("class"))
            let originalCardFooter = $(originalParent).children()[2];
            let originalToggeller = $(originalCardFooter).find("input");

            $(originalToggeller).removeProp("checked")
            parentsArray.splice(i, 1);
            favoriteCoinsToggelers.splice(i, 1)

            break;
        }
    }
    if (favoriteCoinsToggelers.length == 6) {
        $(favoriteCoinsToggelers[5]).removeProp("checked")
        favoriteCoinsToggelers.splice(5, 1);
        parentsArray.splice(5, 1);

    }
}

function validateToggellers() {
    for (let i = 0; i < favoriteCoinsToggelers.length - 3; i++) {
        if (favoriteCoinsToggelers[i] == favoriteCoinsToggelers[1 + 5]) {
            favoriteCoinsToggelers.splice(i + 5, 1);
        }
    }
    favoriteCoinsToggelers = favoriteCoinsToggelers.filter(function (e) {
        return e
    });
}

function checkIfToggellerApears(toggeller) {
    for (let i = 0; i < favoriteCoinsToggelers.length; i++) {
        if (favoriteCoinsToggelers[i] == $(toggeller).attr("id")) {
            return true;
        }
        return false;
    }
}

/// --> End of modal 
// -> ABOUT ME ->
function showMyPersonalInfo() {
    // -> nav bar About event click -->
    $(container).empty();
    let newCard = $("<div>").attr("class", "cardPersonal");
    let cardHead = $("<div>").attr("class", "card-header");
    let cardBody = $("<div>").attr("class", "card-body");
    let cardFooter = $("<div>").attr("class", "card-footer");
    let h3 = $("<h3>");
    let textArea = $("<textarea>").attr("class", "textArea");

    let img = $("<img>").attr("src", "./images/me.jpg");
    let meplay = $("<img>").attr("src", "./images/meplayguitar.jpeg");
    let sky = $("<img>").attr("src", "./images/skysky.jpeg");
    let cow = $("<img>").attr("src", "./images/cow.jpeg");
    let studio = $("<img>").attr("src", "./images/studio.jpg");
    let meonbike = $("<img>").attr("src", "./images/meonbike.jpeg");
    $(h3).html("My Name is Shachar, and you can read some information about me down below.");
    let button = $("<button>").html("Back Home");

    $(textArea).html("My name is shachar ovadia, Located in Jerusalem, 24 years old, \n" +
        "I'm a musician, guitarist,  Music Producer Making Rap , Rock, Electronic and World Wide Music \n" +
        " I like to travel, making food, playing Mobile Legends , and being with friends" +
        "This Project is a John Bryce Full-STACK development course project, the second in its number. \n" +
        "Its been realy fun and learnful to make this project, and getting to know how to work better while codding \n" +
        "Thank you !");

    let link1 = $("<a>").attr("href", "https://www.facebook.com/shachar.s.ovadia/").attr("target", "_blank");
    let facebookI = $("<i>").attr("class", "fab fa-facebook-square");
    $(link1).append(facebookI);
    let link2 = $("<a>").attr("href", "https://www.instagram.com/shacharovadia297/").attr("target", "_blank");
    let instagramI = $("<i>").attr("class", "fab fa-instagram");
    $(link2).append(instagramI);
    let link3 = $("<a>").attr("href", "mailTo:thisisshachar@gmail.com");
    let gmailI = $("<i>").attr("class", "fas fa-envelope-square");
    $(link3).append(gmailI);
    let link4 = $("<a>").attr("href", "https://soundcloud.com/shachar-ovadia-478345553").attr("target", "_blank");
    let soundCloudI = $("<i>").attr("class", "fab fa-soundcloud")
    $(link4).append(soundCloudI);

    $(cardHead).append(img, meplay, studio, cow, sky, meonbike, h3);
    $(cardBody).append(textArea, link1, link2, link3, link4);
    $(cardFooter).append(button).css("bottom", "50px");
    $(newCard).append(cardHead, cardBody, cardFooter);

    $(container).append(newCard);
    styleImgs(img, meplay, studio, cow, sky, meonbike)


    $(cardBody).css({
        "height": "275px"
    })

    $(newCard).css({
        "bottom": "50px",
        "width": "800px",
        "height": "500px"
    });
    $(textArea).attr("disabled", "true");
    $(button).on("click", showHomeScreen);
}

function showHomeScreen() {
    $(container).empty();
    location.reload();
    getAllCoins();
}
// -> chart ->

function onShowLiveCharts() {
    let path = $(location).attr("hash");
    if (path != "#LiveReports") {
        $("#chartContainer").remove();
    }
    if (favoriteCoinsToggelers.length == 0 || favoriteCoinsToggelers.length > 5) {
        alert("You Must choose Max 5 coins to show live report");
        showHomeScreen();

    } else {

        $(container).empty();
        let chartContainer = $("<div>").attr("id", "chartContainer");
        $(container).append(chartContainer);

        let nameOfCoin = "";
        $.each(parentsArray, function (i) {
            nameOfCoin += parentsArray[i].attr("id") + ","
        });
        nameOfCoin = nameOfCoin.slice(0, -1).toUpperCase();
        showChart(nameOfCoin);
        console.log(nameOfCoin)
    }

}

function showChart(nameOfCoin) {
    var option = {
        title: {
            text: "Live Reports"
        },
        data: [],
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            second: 'hh:mm:ss'
                        }
                    }
                }]
            }
        }
    };
    $("#chartContainer").CanvasJSChart(option);
    let xValue = new Date();
    updataData()
    for (let index = 0; index < favoriteCoinsToggelers.length; index++) {
        option.data.push(creatNewData(favoriteCoinsToggelers[index].attr("class")));
    }

    function addData(data) {
        // console.log(data);
        for (let index = 0; index < favoriteCoinsToggelers.length; index++) {
            option.data[index].dataPoints.push({
                x: xValue,
                y: data[favoriteCoinsToggelers[index].attr("class").toUpperCase()].USD
            });
            if (option.data[index].dataPoints.length > 10) {
                option.data[index].dataPoints.splice(0, 1);
            }
        }
        xValue = new Date();
        $("#chartContainer").CanvasJSChart().render();
        setTimeout(updataData, 2000);
    }

    function updataData() {
        $.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + nameOfCoin + "&tsyms=USD", addData);


    }

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
}

function creatNewData(nameOfCoin) {
    let dataPoints = [];
    let newData = {
        type: "spline",
        name: nameOfCoin,
        showInLegend: true,
        xValueFormatString: 'hh:mm:ss',
        yValueFormatString: "#,##0.## $",
        dataPoints: dataPoints
    }
    return newData;
}

function styleImgs(img, meplay, studio, cow, sky, meonbike) {
    $(img).click(function () {
        $(this).css({
            "transform": "scale(8,8)",
        })
    })

    $(img).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })

    $(meplay).click(function () {
        $(this).css({
            "transform": "scale(8,8)",

        })
    })

    $(meplay).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })
    $(studio).click(function () {
        $(this).css({
            "transform": "scale(8,8)",

        })
    })

    $(studio).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })

    $(cow).click(function () {
        $(this).css({
            "transform": "scale(8,8)",

        })
    })

    $(cow).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })

    $(sky).click(function () {
        $(this).css({
            "transform": "scale(8,8)",

        })
    })

    $(sky).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })

    $(meonbike).click(function () {
        $(this).css({
            "transform": "scale(8,8)",

        })
    })

    $(meonbike).hover(function () {
        $(this).css({
            "transform": "scale(2,2)",
            "margin-bottom": "15px",
            "margin-top": "10px"
        });
    }, function () {
        $(this).css({
            "transform": "scale(1,1)",
            "margin-bottom": "0",
            "margin-top": "0"
        });
    })
}
