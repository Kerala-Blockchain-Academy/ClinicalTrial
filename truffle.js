module.exports = {
  build: {
	"Start.html":"Start.html",
    "index.html":"index.html",
	"login.html":"login.html",
	"cro.html"  :"cro.html",
	"pharmalogin.html"  :"pharmalogin.html",
	"Pharmacologist.html"  :"Pharmacologist.html",
	"PrincipalInvestigator.html"  :"PrincipalInvestigator.html",
	"MedicalAffairs.html"  :"MedicalAffairs.html",
	"RegulatoryAffairs.html" :"RegulatoryAffairs.html",
	
    "app.js": [
      "javascripts/jquery.min.js",
	  "javascripts/lightwallet.js",
	  "javascripts/hooked-web3-provider.js",
	  "javascripts/app.js",
	  "javascripts/jspdf.js"
	  
    ],
	"pharmacologist.js": ["javascripts/pharmacologist.js"],
	"PrincipalInvestigator.js":["javascripts/PrincipalInvestigator.js"],
	
	
    "app.css": [
      "stylesheets/app.css",
	  ],
	  "style1.css":[
	  "stylesheets/style1.css"
	  ],
	   "style11.css":[
	  "stylesheets/style11.css"
	  ],
    "images/": "images/"
  },
  rpc: {
    host: "localhost",
    port: 8545,
	gas:4712388
		
  }
};
