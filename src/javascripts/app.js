var accounts;
var account;
var address1;

function getBalance(address) {
	return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether');
}

// switch to hooked3webprovider which allows for external Tx signing
// (rather than signing from a wallet in the Ethereum client)
function switchToHooked3(_keystore) {

	console.log("switchToHooked3");

	var web3Provider = new HookedWeb3Provider({
	  host: "http://localhost:8545", // check what using in truffle.js
	  transaction_signer: _keystore
	});

	web3.setProvider(web3Provider);
}




function RegisterCRO() {
	
    var metaset = Clinictrial.deployed();

	var hypo	 		= document.getElementById('hypo').value;
    var drugname 		= document.getElementById('drugname').value;
	var dosage 			= document.getElementById('dosage').value;
	var subjectcount 	= parseInt(document.getElementById('subjectcount').value);    
	var criteria	 	= document.getElementById('criteria').value;
	var role		 	= document.getElementById('role').value;
	
	
	metaset.setcro(hypo, drugname, dosage, subjectcount, criteria ,role, {from: account,gas:800000}).then(function() {
		console.log("cro registration done");
		console.log("Transaction complete!");
     
		}).catch(function(e) {
		console.log(e);
	
  });
 
};

function GetCRODetails() {
	
	
  
	var meta = Clinictrial.deployed();
	
	var testid = document.getElementById("test_id").value;
	console.log("Initiating transaction... (please wait)");

     
  meta.getcro.call( testid, {from: account}).then(function(value) {
	  
	  var span_element12 = document.getElementById("getval12");
	  var res1 = web3.toAscii(value[1].valueOf());
	  span_element12.innerHTML = res1;
	  
	  var span_element13 = document.getElementById("getval13");
	  var res2 = web3.toAscii(value[2].valueOf());
	  span_element13.innerHTML = res2;
	  
	  var span_element14 = document.getElementById("getval14");
	  var res3 = web3.toAscii( value[3].valueOf());
	  span_element14.innerHTML = res3;
	  
	    
	  var span_element15 = document.getElementById("getval15");
	 
	  span_element15.innerHTML =  value[4].valueOf();
	  
	  	  
	  var span_element16 = document.getElementById("getval16");
	  var res5 = web3.toAscii(value[5].valueOf());
	  span_element16.innerHTML = res5;
	  
	  var span_element17 = document.getElementById("getval17");
	  var res6 = web3.toAscii(value[6].valueOf());
	  span_element17.innerHTML = res6;
	  
	  
	
	console.log("Gettting UserDetails");
	
		
	
	console.log("Transaction complete!");
    
  }).catch(function(e) {
    console.log(e);

  });
  
	var table = document.getElementById("table2");
	table.style.display = 'block'; 
    

};

function Terminate(){
	

	if(document.getElementById('s1').checked){
	var table = document.getElementById("table3");
	table.style.display = 'block'; 
	var input1 = document.getElementById("pharmacokinetics");
	input1.style.display = 'inline';
	var input2 = document.getElementById("pharmacodynamics");
	input2.style.display = 'inline';	
	var fs = document.getElementById("final_details");
	fs.style.display = 'inline';
	}
	
	
}




function Popupup(){
	var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}




//register volunteer

function RegisterUser() {
	
    var metaset = Clinictrial.deployed();
	
	var name 	= document.getElementById('name').value;
    var contact = document.getElementById('contact').value;
	var weight 	= document.getElementById('weight').value;
	var height 	= document.getElementById('height').value;    
	var dob 	= document.getElementById('dob').value;
	var allergy = document.getElementById('allergy').value;
	var histor 	= document.getElementById('history').value;
	var gender;
	var race;
	var smoke = false;
	var pharmacologist = document.getElementById('pharmacologist').value;
	if (document.getElementById('g1').checked) {
    gender = document.getElementById('g1').value;
    }
	else if(document.getElementById('g2').checked) {
    gender = document.getElementById('g2').value;
    }
	else if(document.getElementById('g3').checked) {
    gender = document.getElementById('g3').value;
    }
	
	if (document.getElementById('c1').checked) {
    race = document.getElementById('c1').value;
    }else if(document.getElementById('c2').checked) {
    race = document.getElementById('c2').value;
    }else if(document.getElementById('c3').checked) {
    race = document.getElementById('c3').value;
    }
	
	if (document.getElementById('s1').checked) {
    smoke = true;
    }else if(document.getElementById('s2').checked) {
    smoke = false;
    }
	
	
	
	console.log(race);
	console.log(gender);
	console.log("Initiating transaction... (please wait)");
  
	var msgResult;
	console.log("inside function");
	
	var secretSeed = lightwallet.keystore.generateRandomSeed();
		

	lightwallet.keystore.deriveKeyFromPassword(name, function (err, pwDerivedKey) {

		console.log("createWallet");
		
		console.log(secretSeed);
	
		var keystore = new lightwallet.keystore(secretSeed, pwDerivedKey);
		
		keystore.generateNewAddress(pwDerivedKey);
		// generate one new address/private key pairs
		// the corresponding private keys are also encrypted
		var address = keystore.getAddresses()[0];
		address1 = address;		
		var privateKey = keystore.exportPrivateKey(address, pwDerivedKey);
		byteaddr = address.toString();
		//address1 = byteaddr;
		metaset.RegisterVolunteer(name, contact, dob, gender, weight, height,  race, smoke, allergy, histor , byteaddr ,pharmacologist, {from: account,gas:900000}).then(function() {
		console.log("registration done");
		console.log("Transaction complete!");
     
		}).catch(function(e) {
		console.log(e);
	
  });

		
		
		console.log(address);
		console.log(privateKey);
		console.log(getBalance(address));
		// Now set ks as transaction_signer in the hooked web3 provider
		// and you can start using web3 using the keys/addresses in ks!

		switchToHooked3(keystore);
		

	});
	
// var address1 = keystore.getAddresses()[0];
	console.log(address1);
	
 
};

function GetUserDetails() {
	
	console.log(address1);
  
	var meta = Clinictrial.deployed();
	var volunteerid = document.getElementById("volunteer").value;
//	var pharmacologist = document.getElementById('pharmacologist').value;
	
	console.log("Initiating transaction... (please wait)");

     
  meta.getvolunteer.call( volunteerid, {from: account}).then(function(value) {
	  
	  var span_element1 = document.getElementById("getval1");
	  var res0 = web3.toAscii(value[0]);
	  span_element1.innerHTML = res0;
	  
	  var span_element2 = document.getElementById("getval2");
	  span_element2.innerHTML = value[1].valueOf();
	  
	  var span_element3 = document.getElementById("getval3");
	  var res2 = web3.toAscii(value[2].valueOf());
	  span_element3.innerHTML = res2;
	  
	  var span_element4 = document.getElementById("getval4");
	  var res3 = web3.toAscii(value[3].valueOf());
	  span_element4.innerHTML = res3;
	  
	  var span_element5 = document.getElementById("getval5");
	  span_element5.innerHTML = value[4].valueOf();
	  
	  
	  
	  var span_element6 = document.getElementById("getval6");
	  span_element6.innerHTML =  value[5].valueOf();
	  
	  
	  var span_element7 = document.getElementById("getval7");
	  var res6 = web3.toAscii(value[6].valueOf());
	  span_element7.innerHTML =  res6;
	  
	  
	  var span_element8 = document.getElementById("getval8");
	  span_element8.innerHTML = value[7].valueOf();
	  
	  var span_element9 = document.getElementById("getval9");
	  var res8 = web3.toAscii(value[8].valueOf());
	  span_element9.innerHTML = res8;
	  
	  var span_element10 = document.getElementById("getval10");
	  var res9 = web3.toAscii(value[9].valueOf());
	  span_element10.innerHTML = res9;
	  
	  
	
	console.log("Gettting UserDetails");
	
		
	
	console.log("Transaction complete!");
    
  }).catch(function(e) {
    console.log(e);

  });
  

  
  
  
var table = document.getElementById("table1");
  table1.style.display = 'block';
    

};

function dfr() {
	var table = document.getElementById("table1");
  table1.style.display = 'none';

};





function PrintUserDetails() {
	
	console.log(address1);
  
	var meta = Clinictrial.deployed();
	var volunteerid = document.getElementById("volunteer").value;
	var v0 = document.getElementById("getval10").innerHTML;
	var v1 = document.getElementById("getval11").innerHTML;
	var v2 = document.getElementById("getval12").innerHTML;
	var v3 = document.getElementById("getval13").innerHTML;
	var v4 = document.getElementById("getval14").innerHTML;
	var v5 = document.getElementById("getval15").innerHTML;
	var v6 = document.getElementById("getval16").innerHTML;
	
	console.log("Initiating transaction... (please wait)");

	var doc = new jsPDF();

	doc.setFontSize(20);
	doc.text(70,25,"Clinical Trial Report");
	doc.setFontSize(12);
	doc.text(20,40,"Volunteer ID : " + volunteerid);
	doc.text(20,50,"Medical Condition : " + v0);
	doc.text(20,60,"Seriousness : " + v1);
	doc.text(20,70,"Expectedness : " + v2);
	doc.text(20,80,"Relatedness : " + v3);
	doc.text(20,90,"Effectiveness : " + v4);
	doc.text(20,100,"SideEffects : " + v5);
	doc.text(20,110,"TestSuccess : " + v6);
    doc.save('trial-report.pdf');
};


function InvestigatorSubmit(){

	var meta = Clinictrial.deployed();
	
	var volunteerid 	= document.getElementById("volunteer").value;
	var Seriousness 	= document.getElementById('Seriousness').value;
    var Expectedness	= document.getElementById('Expectedness').value;
	var Relatedness 	= document.getElementById('Relatedness').value;
	
	
	console.log("Initiating transaction... (please wait)");

     
	meta.setPi( volunteerid,Seriousness,Expectedness,Relatedness, {from: account,gas:1000000}).then(function() {
	  
	  
	 
	console.log("InvestigatorSubmit() complete!");
    
  }).catch(function(e) {
    console.log(e);

  });
  

}

function ProceedPhase(){
	
var meta = Clinictrial.deployed();
	
	var volunteerid 	= document.getElementById("volunteer").value;
	var Effectiveness 	= document.getElementById('Effectiveness').value;
    var SideEffects		= document.getElementById('SideEffects').value;
	var TestSuccess 	= document.getElementById('TestSuccess').value;
	
	
	console.log("Initiating transaction... (please wait)");

     
	meta.setMi( volunteerid,Effectiveness,SideEffects,TestSuccess, {from: account,gas:1000000}).then(function() {
	  
	  
	 
	console.log("ProceedPhase() complete!");
    
  }).catch(function(e) {
    console.log(e);

  });

}

function logincro(){
	var username =document.getElementById("username").value;  
	console.log(username);
	var password =document.getElementById("password").value;  
	console.log(password);
		if(username=="cro1" && password=="cro1")
		{
			window.location.href = "cro.html";
		}
			
		else if(username=="William" && password=="Medical123")
		{
			window.location.href = "cro.html";
		}
		else if(username=="Phil Brooks" && password=="Pharmacology123")
		{
			window.location.href = "cro.html";
		}
		else if(username=="Parker J" && password=="Regulatory123")
		{
			window.location.href = "cro.html";
		}
			
		else { 
		alert("Account login failed due to several reasons");
		}
	
}

function pharmalogin(){
	
	var username =document.getElementById("pusername").value;  
	console.log(username);
	var password1 =document.getElementById("ppassword").value;  
	console.log(password1);
		if(username=="pharma1" && password1=="pharma1")
		{
			window.location.href = "Pharmacologist.html";
		}
			
		else if(username=="William" && password1=="Medical123")
		{
			window.location.href = "Pharmacologist.html";
		}
		else if(username=="Phil Brooks" && password1=="Pharmacology123")
		{
			window.location.href = "Pharmacologist.html";
		}
		else if(username=="Parker J" && password1=="Regulatory123")
		{
			window.location.href = "Pharmacologist.html";
		}
			
		else { 
		alert("Account login failed due to several reasons");
		}
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