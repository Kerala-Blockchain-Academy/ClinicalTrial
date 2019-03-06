var accounts;
var account;
var conaddress = "0x351994B8bA0307a33A6087b1C1219687c2cf5d53";
function tableget() {
	
	var meta = Clinictrial.at(conaddress);
	var volunteerid = document.getElementById("volunteer").value;
	meta.getPi.call( volunteerid, {from: account}).then(function(value) {
	  
	  var span_element11 = document.getElementById("getval11");
	  var res10 = web3.toAscii(value[0].valueOf());
	  span_element11.innerHTML = res10;
	  
	  var span_element12 = document.getElementById("getval12");
	  var res11 = web3.toAscii(value[1].valueOf());
	  span_element12.innerHTML = res11;
	  
	  var span_element13 = document.getElementById("getval13");
	  var res12 = web3.toAscii(value[2].valueOf());
	  span_element13.innerHTML = res12;
	  
	  console.log("Getting PI Transaction complete!");
    
  }).catch(function(e) {
    console.log(e);

  });  
  
}
  
  function tableget1() {
	
	var meta = Clinictrial.at(conaddress);
	var volunteerid = document.getElementById("volunteer").value;
	meta.getMi.call( volunteerid, {from: account}).then(function(value) {
	  
	  var span_element14 = document.getElementById("getval14");
	  var res14 = web3.toAscii(value[0].valueOf());
	  span_element14.innerHTML = res14;
	  
	  var span_element15 = document.getElementById("getval15");
	  var res15 = web3.toAscii(value[1].valueOf());
	  span_element15.innerHTML = res15;
	  
	  var span_element16 = document.getElementById("getval16");
	  var res16 = web3.toAscii(value[2].valueOf());
	  span_element16.innerHTML = res16;
	  
	  console.log("Getting MI Transaction complete!");
    
  }).catch(function(e) {
    console.log(e);

  });  
  
}
  
  window.onload = function() {
  
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
	

	
  });
 
 	
}