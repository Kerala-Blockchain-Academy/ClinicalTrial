pragma solidity ^0.4.7;

contract Clinictrial {  
    struct Volunteer {
        bytes32 vname;
        uint128 vcontact;
        bytes32 vdob;
        bytes32 vg;
        uint128 vw;
        uint128 vh;
        bytes32 vr;
        bool vs;
        bytes32 vallergy;
        bytes32 vmedic;
        bytes32 lightwallet;  
        bytes32 vpharma;    
    }
    
    struct pharmacologist {
        uint id;
        bytes32 name;
    }

    struct registerpharma {

        bytes32 testdate;
        uint128 week;
        bytes32 dosage;
        bytes32 state;
        bytes32 sideffects;
        bytes32 outcome;
        bool terminate;
        bytes32 kinetics;
        bytes32 dynamics;

    }

    struct cro {
        uint128 tid;
        bytes32 thyp;
        bytes32 drug;
        bytes32 dose;
        uint128 vc;
        bytes32 criteria;
        bytes32 pname;
        
    }
    
     mapping(uint128 => cro) c1;
     mapping(uint => pharmacologist) p1;
     mapping(uint128 => registerpharma) rp1;
       
    address public clinic;
    uint i;
    uint ph;
    uint ch;
    uint128 th;

    mapping(bytes32 => Volunteer) v1;
    
    mapping(uint => Volunteer) v2;
    uint count;
    bytes32 naddr;

    function Clinictrial() {
        clinic = msg.sender;
    }


    struct Pi {
        bytes32 volid;
        bytes32 seriousness;
        bytes32 expectedness;
        bytes32 relatedness;
        
    }

mapping(bytes32 => Pi) pp1;

  struct Mi {
        bytes32 volid;
        bytes32 effectiveness;
        bytes32 sideeffects;
        bytes32 testsuccess;
        
    }

mapping(bytes32 => Mi) mi1;

function setcro( bytes32 hyp, bytes32 drug, bytes32 dose, uint128 vc, bytes32 criteria, bytes32 pname) returns(uint128 tid) {   
        tid = th++;
        cro c = c1[tid];
        c.tid = tid;
        c.thyp=hyp;
        c.drug=drug;
        c.dose=dose;
        c.vc=vc;
        c.criteria=criteria;
        c.pname = pname;
    }
    function getcro(uint128 id) returns ( uint128, bytes32, bytes32, bytes32, uint128, bytes32,bytes32) {
        cro c = c1[id];
        return(c.tid,c.thyp,c.drug,c.dose,c.vc,c.criteria,c.pname);
    }

     function getcroid(uint128 id) returns (uint128) {
        cro c = c1[id];
        return(c.tid);
    }


    function RegisterVolunteer (bytes32 vname, uint128 vcontact, bytes32 vdob, bytes32 vg, uint128 vw, uint128 vh, bytes32 vr, bool vs, bytes32 vallergy, bytes32 vmedic, bytes32 light, bytes32 pharmacologist) returns (uint id) { 
       
       naddr = light;
    
       Volunteer v  = v1[naddr];
       Volunteer vn = v2[count];
       v.vname=vname;
       v.vcontact=vcontact;
       v.vdob=vdob;
       v.vg=vg;
       v.vw=vw;
       v.vh=vh;
       v.vr=vr;
       v.vs=vs;
       v.vallergy=vallergy;
       v.vmedic = vmedic;
       v.lightwallet = light;
       vn.lightwallet = light;
       v.vpharma = pharmacologist;
       count++;
    }
   
   bytes32 pharmachecker;
    function getvolunteer(bytes32 j) returns(bytes32, uint128, bytes32, bytes32, uint128, uint128, bytes32, bool, bytes32, bytes32, bytes32,bytes32) {
        Volunteer v = v1[j];
        pharmachecker = v.vpharma;
        return(v.vname,v.vcontact,v.vdob,v.vg,v.vw,v.vh,v.vr,v.vs,v.vallergy,v.vmedic, v.lightwallet,v.vpharma);
    }

    function getvolunteernew(uint j) returns(bytes32) {
       
        Volunteer v = v2[j];
    
        return(v.lightwallet);
        
    }

      function pharma (bytes32 n) returns(uint pid) {
        pid = ph++;
        pharmacologist p = p1[pid];
        p.name=n;
        
    }

   uint128 count1;
   
   function pharmadetails(bytes32 testdate, uint128 week, bytes32 dosage, bytes32 state, bytes32 sideffects, bytes32 outcome, bool terminate, bytes32 kinetics, bytes32 dynamics) returns (uint128 rpid) {
    rpid = count1++;
    registerpharma rp = rp1[rpid];
   
   rp.testdate = testdate;
   rp.week = week;
   rp.dosage =dosage;
   rp.state = state;
   rp.sideffects = sideffects;
   rp.outcome = outcome;
   rp.terminate = terminate;
   rp.kinetics = kinetics;
   rp.dynamics = dynamics;
   }

   
  function setPi(bytes32 volid, bytes32 seriousness, bytes32 expectedness, bytes32 relatedness) {
    Pi pp = pp1[volid];
    pp.volid = volid;
    pp.seriousness = seriousness;
    pp.expectedness = expectedness;
    pp.relatedness = relatedness;      
  }

  function getPi(bytes32 volid) returns(bytes32, bytes32, bytes32) {
      Pi pp = pp1[volid];
      return(pp.seriousness,pp.expectedness,pp.relatedness); 

  }
  function setMi(bytes32 volid, bytes32 effectiveness, bytes32 sideeffects, bytes32 testsuccess) {
    Mi mi = mi1[volid];
    mi.volid = volid;
    mi.effectiveness = effectiveness;
    mi.sideeffects = sideeffects;
    mi.testsuccess = testsuccess;      
  }

  function getMi(bytes32 volid) returns(bytes32, bytes32, bytes32) {
      Mi pp = mi1[volid];
      return(pp.effectiveness,pp.sideeffects,pp.testsuccess); 

  }
}