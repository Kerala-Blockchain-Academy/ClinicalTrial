var accounts;
var account;

function PopulateVolunteer() {
	
	var meta = Clinictrial.deployed();
	
		
		for(var i = 0; i < 5; i++) {
		
		
		meta.getvolunteernew.call( i, {from: account}).then(function(value) {
		var sel = document.getElementById('volunteer');
		var opt = document.createElement('option');
		opt.innerHTML = value;
		opt.value = value;
		if(value!=null)
		sel.appendChild(opt);	
	}).catch(function(e) {
    console.log(e);

  });
}

	for(var i = 0; i < 5; i++) {
		
		
		meta.getcroid.call( i, {from: account}).then(function(value) {
		var sel = document.getElementById('test_id');
		var opt = document.createElement('option');
		opt.innerHTML = value;
		opt.value = value;
		if(value!=null)
		sel.appendChild(opt);	
	}).catch(function(e) {
    console.log(e);

  });
}
  


}

function savePharmaDetails(){

	var metaset = Clinictrial.deployed();
	var test_date	 	= document.getElementById('test_date').value;
	var week	 		= parseInt(document.getElementById('week').value);
    var dosage1 		= document.getElementById('dosage1').value;
	var subject_state 	= document.getElementById('subject_state').value;    
	var side_effects	= document.getElementById('side_effects').value;
	var outcome		 	= document.getElementById('outcome').value;
	var terminate		= false;
	var kinetics 		= document.getElementById('pharmacokinetics').value;
	var dynamics 		= document.getElementById('pharmacodynamics').value;
	
	/* if (document.getElementById('s1').checked) {
    terminate = true;
    }else if(document.getElementById('s2').checked) {
    terminate = false;
    } */
	
	metaset.pharmadetails(test_date, week, dosage1, subject_state, side_effects, outcome , terminate, kinetics, dynamics, {from: account,gas:1000000}).then(function() {
		console.log("pharmacologist details registration done");
		console.log("Transaction complete!");
     
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
 
  PopulateVolunteer();	
}