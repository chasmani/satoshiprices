// Would be a good diea to save the price data in a javascreipt variable
// Then if any update function fails, it can be ignored
// And if the user looks for a conversion that we already have, will be much quicker than sending a fresh AJAX request

// TO DO - Change the dropdown box to an autofill box
// TO DO - ONCE DONE AUTOFILL BOX, fill CRYTPOCODE data from cryptocompare directly

// Initial values for the currency codes
var CRYPTOCODES = {
	"USD":"US Dollar",
	"SAT":"Satoshi",
	"BTC":"Bitcoin", 
	"ETH":"Ethereum", 
	"LTC":"Litecoin",
	"GBP":"Great British Pound",
	"EUR":"Euro",
	"JPY":"Japanese Yen",
}

// Initial values for price data
var BTCPRICES = {
	"SAT":100000000,
	"BTC":1
}

var CRYPTONAMES = [
	"Satoshi (SAT)",
	"Bitcoin (BTC)"
]



// Update the data stored locally from the cryptocompare API
// Update the prices to the apge and the conversion tool
function getPrices(){

	$.getJSON("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR,GBP,JPY,ETH,LTC", function(data) {
	    // Collect the data in the BTCPRICES variable
	    Object.assign(BTCPRICES, data);
	    // Update the prices to the website
	    updatePrices();
	    // Update the dropdown currency options
	    updateDropdowns();
	    updateAutocomplete();
	    // Do an inital conversion for the default value in the left box
	    calculateConversion("right");
		});
}

// This should be replaced with an autofill function and user input box
function updateDropdowns(){

	// Get current selections
	var currency1Symbol = $("#currency1-name option:selected").val();
	var currency2Symbol = $("#currency2-name option:selected").val();	

	// Repopulate the list
	$("#currency1-name").html("");
	$("#currency2-name").html("");
	optionsHtml = ""
	for (key in CRYPTOCODES){
		console.log(key);
		optionsHtml += '<option value="' + key + '">' + CRYPTOCODES[key] + ' (' + key +')</option>';
	} 
	$("#currency1-name").html(optionsHtml);
	$("#currency2-name").html(optionsHtml);

	// Set the option back to what it was selected as
	$("#currency1-name option[value=" + currency1Symbol).attr("selected", true);
	// Set the option back to what it was selected as
	$("#currency2-name option[value=" + currency2Symbol).prop("selected", true);
}


function updateAutocomplete(){

	CRYPTONAMES = []

	for (key in CRYPTOCODES){
		coinName =  CRYPTOCODES[key] + " (" + key + ")";
		CRYPTONAMES.push(coinName);
	}

	$( "#currency1nameauto, #currency2nameauto" ).autocomplete({
      source: CRYPTONAMES
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

// Helper function ro convert numbers into readable format
function convertNumber(number){
	return parseFloat(number.toPrecision(4))
}

// Left direction calculates the left currency value based on the right selection
function calculateConversion(direction){

	// Get all the current variables from the form
	var currency1Symbol = $("#currency1-name option:selected").val();
	var currency1Amount = $("#currency1-amount").val();
	var currency2Symbol = $("#currency2-name option:selected").val();
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





$(document).ready(getPrices);

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


var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    
$( "#tags" ).autocomplete({
      source: availableTags
    });
  


