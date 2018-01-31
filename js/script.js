// Would be a good diea to save the price data in a javascreipt variable
// Then if any update function fails, it can be ignored
// And if the user looks for a conversion that we already have, will be much quicker than sending a fresh AJAX request

// TO DO - Change the dropdown box to an autofill box
// TO DO - ONCE DONE AUTOFILL BOX, fill CRYTPOCODE data from cryptocompare directly

// Initial values for the currency codes
var CRYPTOCODES = {
	"US Dollar $ (USD)":"USD",
	"Satoshi (SAT)":"SAT",
	"Bitcoin (BTC)":"BTC", 
	"Ethereum (ETH)":"ETH", 
	"Litecoin (LTC)":"LTC",
	"Great British Pound £ (GBP)":"GBP",
	"Euro € (EUR)":"EUR",
	"Japanese Yen ¥ (JPY)":"JPY",
	"Monero (XMR)":"XMR",
	"South Korean Won (KRW)":"KRW",
	"Indian Rupee (INR)":"INR",
}

// Initial values for price data
var BTCPRICES = {
	"SAT":100000000,
	"BTC":1
}

// Keep track of coins treid. Some coins fail api call, so need to not call them again
var CRYPTOCODESTRIED = [];
// Cryptocompare API has a max length on the tsymb count
var TSYMMAXLENGTH = 500;

// Store autocomplete names in it's own array, to improve performance
var CRYPTONAMES = []

var TOPCOINS = ["ETH","BCH","XRP","ICX","LSK","XLM","LTC","EOS","NEO","TRX","ELF","ETC","VEN","ADA","DASH","XMR","ZEC","IOST","HSR","QTUM","WAVES","OMG","XVG","NBT","BNB","SC","CND","IOT","BTG","GAS","PPT","STEEM","XEM","KNC","STRAT","WTC","DGD","ADX","ZCL","XDN","ZRX","DGB","BTS","SWFTC","REQ","SNT","DOGE","BRD","SUB","POE","ARDR","BAT","XRB"]

// initial request for coin data, to get the site working with main coins after 1 API call
// Update the data stored locally from the cryptocompare API
// Update the prices to the page and the conversion tool
function getInitialPrices(){

	$.getJSON("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR,GBP,JPY,KRW,INR,ETH,LTC", function(data) {
	    // Collect the data in the BTCPRICES variable
	    Object.assign(BTCPRICES, data);
	    // Update the prices to the website
	    updatePrices();
	    // Update the autocomplete options
	    updateAutocomplete();
	    // Do an inital conversion for the default value in the left box
	    calculateConversion("right");
	    // Get all the other coins
	    getCoins();
		});
}

// Get any coin prices we don't have yet
// Keeps sending API requests (recursive) until it has tried every coin we don't have prices for
function getMorePrices(){

	var tsymbString = ""

	// Bulid the tsymb string based on what coins we want to get prices for
	for (var key in CRYPTOCODES){
		if((!BTCPRICES[CRYPTOCODES[key]])									// We don't have a price for it yet 
			&&(tsymbString.length<(TSYMMAXLENGTH-10))						// tsymb string is not too long
			&&($.inArray(CRYPTOCODES[key], CRYPTOCODESTRIED) == -1)){		// Not tried code in this run
				tsymbString += (CRYPTOCODES[key] + ",");
				CRYPTOCODESTRIED.push(CRYPTOCODES[key])	
		}
	}	
	
	// If the tsymbString length is zero, it means that we have tried all the coins, so stop
	if(tsymbString.length>0){
		apiRequestUrl = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=" + tsymbString
		$.getJSON(apiRequestUrl, function(data) {
		    // Collect the data in the BTCPRICES variable
		    Object.assign(BTCPRICES, data);
		    // Update the autocomplete options
		    updateAutocomplete();
		    // Get the next batch of price
		    getMorePrices();
			});
	}
}


// Get list of coins on the cryptocompare api
function getCoins(){

	$.getJSON("https://min-api.cryptocompare.com/data/all/coinlist", function(data) {

		// Update the CRYPTOCODES dictionary with the data from the API
		for (var key in data["Data"]) {
			if($.inArray(data["Data"][key]["Symbol"], TOPCOINS) != -1){
				CRYPTOCODES[data["Data"][key]["FullName"]] = data["Data"][key]["Symbol"];	
			}
		}

		updateDropdowns();
		// Start getting all the coin prices
	    getMorePrices();
	});
}

// Update the currency dropdown list
function updateDropdowns(){
 
	var currency1Symbol = $("#currency1-name option:selected").val();
	var currency2Symbol = $("#currency2-name option:selected").val();
	
	$("#currency1-name").html("");
	$("#currency2-name").html("");
	optionsHtml = ""
	var sortedKeys = Object.keys(CRYPTOCODES).sort();
	for(var i=0;i<sortedKeys.length;i++){
		optionsHtml += '<option value="' + CRYPTOCODES[sortedKeys[i]] + '">' + sortedKeys[i] + '</option>';
	}

 	$("#currency1-name").html(optionsHtml);
 	$("#currency2-name").html(optionsHtml);

 	// Set the option back to what it was selected as
 	$("#currency1-name option[value=" + currency1Symbol).attr("selected", true);
 	$("#currency2-name option[value=" + currency2Symbol).attr("selected", true);
 }


// Update the autocomplete using the CRYPTOCODES dictionary
function updateAutocomplete(){

	// Get only the cryptocurrency names that we have a btc price for
	CRYPTONAMES = []

	for (var key in CRYPTOCODES){
		if(BTCPRICES[CRYPTOCODES[key]]){
			CRYPTONAMES.push(key);
		}
	}
	
	// Create the autocompletes
	$( "#currency1-name").autocomplete({
      source: CRYPTONAMES,
      minLength: 2, // Change this if performance suffers once we have thousands of currencies
      close: function(ev,ui){
      	calculateConversion("left");
      }
    });
    $( "#currency2-name").autocomplete({
      source: CRYPTONAMES,
      minLength: 2,
      close: function(ev,ui){
      	calculateConversion("right");
      }
    });
}


// Update the prices on the page using the data stored locally
function updatePrices(){

	// USD
    var satPriceUSD = BTCPRICES["USD"]/BTCPRICES["SAT"];
    $(".sat_USD").html(convertNumber(satPriceUSD));
    $(".1000sat_USD").html(convertNumber(1000*satPriceUSD));
    $(".USD_sat").html(convertNumber(1/satPriceUSD));
    
    // EUR
    var satPriceEUR = BTCPRICES["EUR"]/BTCPRICES["SAT"];
    $(".EUR_sat").html(convertNumber(1/satPriceEUR));
    $(".sat_EUR").html(convertNumber(satPriceEUR));
    $(".1000sat_EUR").html(convertNumber(1000*satPriceEUR));
    
    // GBP
    var satPriceGBP = BTCPRICES["GBP"]/BTCPRICES["SAT"];
    $(".GBP_sat").html(convertNumber(1/satPriceGBP));
    $(".sat_GBP").html(convertNumber(satPriceGBP));
    $(".1000sat_GBP").html(convertNumber(1000*satPriceGBP));
    
    // JPY
    var satPriceJPY = BTCPRICES["JPY"]/BTCPRICES["SAT"];
    $(".JPY_sat").html(convertNumber(1/satPriceJPY));
}

// Helper function to convert numbers into readable format
function convertNumber(number){
	return parseFloat(number.toPrecision(4))
}

// Left direction calculates the left currency value based on the right selection
function calculateConversion(direction){

	// Get the coin symbols from the input field and CRYPTOCODES dictionary
	var currency1Symbol = $("#currency1-name").val()
	var currency2Symbol = $("#currency2-name").val()

	if(currency1Symbol&&currency2Symbol){
		console.log("Got valid symbols")
		var currency1Amount = $("#currency1-amount").val();
		var currency2Amount = $("#currency2-amount").val();
	
		if (direction=="left"){
			// Work out the value in BTC
			var amountBTC = currency2Amount/BTCPRICES[currency2Symbol];	
			// Convert to needed currency
			var currency1Amount = amountBTC * BTCPRICES[currency1Symbol];
			// Populate in form
		$("#currency1-amount").val(convertNumber(currency1Amount));
		} else if (direction=="right"){
			// Work out the value in BTC
			var amountBTC = currency1Amount/BTCPRICES[currency1Symbol];	
			// Convert to needed currency
			var currency2Amount = amountBTC * BTCPRICES[currency2Symbol];
			// Populate in form
			$("#currency2-amount").val(convertNumber(currency2Amount));
		}
	}
}


$(document).ready(getInitialPrices);

$("#currency2-amount").on("keyup", function(){
	calculateConversion("left");
})

$("#currency2-name").on("change", function(){
	calculateConversion("right");	
})

$("#currency1-amount").on("keyup", function(){
	calculateConversion("right");
})

$("#currency1-name").on("change", function(){
	calculateConversion("left");	
})



// To begin with, on page load, the user needs to be able to get basic info for the main coins as quickly as possible. So one API call for the top 50 coins.

// Maybe also add an URL pattern to a coin to the initial api call, and also show this coin data as a priority. LATER

// Once the intial prices are loaded, other data should eb updated in the background with as few API calls as possible. 

// PRINCIPLE - The autocomplete boxes should always only show coins that we have the data for. 

// So, what fi we had a few variable to ahdnle this:
// CRYPTOPRICES[CODE] = PRICE_IN_BTC      	Prices of coins that we have
// CRYPTOCODES[FUllName] = SYMBOL  			List of all names and the matching code
// CRYPTONAMES = []							List of cryptonames for the autocomplete data. Only has names that we have price data for


// This suggests several functions
// updateAutocomplete() 					Iterate through CRYPTOCODES, check is SYMBOL has an entry in CRYPTOPRICEs. If it does, add to CRYPTONAMES



// getMorePrices							Iterate through CRYPTOCODES, if symbol doesn't exist in CRYPTOPRICES, add to an url request. Once url gets to a certain length, send AJAX request
// 											Might be worthwhile to somehow map or combine the dictionaries to get the list of symbols to add
//											This can also be used to run the first api call, if the CRYPTOCODES data is onyl the mos important coins, then this will work. then add more codes once it's done 
//											Q. how to get most popular coins?  Could hard code it into the script, but then what if a coin changes it's FullName? or changes it's symbol? Will we end up with two coins in the results?


// ASSUMPTIONS - 
// CRYPTOCOMPARE api won't mind me doing loads of requests
// Can get all data without doing huge amount of api calls - what's the max character limit for prices? Do any coins fail? Character limit is 500. 
// Having all the data will not signficantly slow down the app. Doesn;t seem to. Got 2064 
// 