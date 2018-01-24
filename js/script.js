// Would be a good diea to save the price data in a javascreipt variable
// Then if any update function fails, it can be ignored
// And if the user looks for a conversion that we already have, will be much quicker than sending a fresh AJAX request

// TO DO - Change the dropdown box to an autofill box
// TO DO - ONCE DONE AUTOFILL BOX, fill CRYTPOCODE data from cryptocompare directly

// Initial values for the currency codes
var CRYPTOCODES = {
	"US Dollar (USD)":"USD",
	"Satoshi (SAT)":"SAT",
	"Bitcoin (BTC)":"BTC", 
	"Ethereum (ETH)":"ETH", 
	"Litecoin (LTC)":"LTC",
	"Great British Pound (GBP)":"GBP",
	"Euro (EUR)":"EUR",
	"Japanese Yen (JPY)":"JPY"
}

// Initial values for price data
var BTCPRICES = {
	"SAT":100000000,
	"BTC":1
}

// Store autocomplet enames in it's own array, to improve performance
var CRYPTONAMES = []

// Update the data stored locally from the cryptocompare API
// Update the prices to the apge and the conversion tool
function getPrices(){

	$.getJSON("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR,GBP,JPY,ETH,LTC", function(data) {
	    // Collect the data in the BTCPRICES variable
	    Object.assign(BTCPRICES, data);
	    // Update the prices to the website
	    updatePrices();
	    // Update the autocomplete options
	    updateAutocomplete();
	    // Do an inital conversion for the default value in the left box
	    calculateConversion("right");
		});
}


// Update the autocomplete using the CRYPTOCODES dictionary
function updateAutocomplete(){

	CRYPTONAMES = Object.keys(CRYPTOCODES);

	$( "#currency1-name").autocomplete({
      source: CRYPTONAMES,
      minLength: 0, // Change this if performance suffers once we have thousands of currencies
      close: function(ev,ui){
      	calculateConversion("left");
      }
    });
    $( "#currency2-name").autocomplete({
      source: CRYPTONAMES,
      minLength: 0,
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
	var currency1Symbol = CRYPTOCODES[$("#currency1-name").val()]
	var currency2Symbol = CRYPTOCODES[$("#currency2-name").val()]

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


$(document).ready(getPrices);

$("#currency2-amount").on("keyup", function(){
	calculateConversion("left");
})

$("#currency2-name").on("keyup", function(){
	calculateConversion("right");	
})

$("#currency1-amount").on("keyup", function(){
	calculateConversion("right");
})

$("#currency1-name").on("keyup", function(){
	calculateConversion("left");	
})

