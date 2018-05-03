var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("Clinictrial error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Clinictrial error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("Clinictrial contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Clinictrial: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to Clinictrial.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Clinictrial not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "id",
            "type": "uint128"
          }
        ],
        "name": "getcroid",
        "outputs": [
          {
            "name": "",
            "type": "uint128"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "clinic",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "testdate",
            "type": "bytes32"
          },
          {
            "name": "week",
            "type": "uint128"
          },
          {
            "name": "dosage",
            "type": "bytes32"
          },
          {
            "name": "state",
            "type": "bytes32"
          },
          {
            "name": "sideffects",
            "type": "bytes32"
          },
          {
            "name": "outcome",
            "type": "bytes32"
          },
          {
            "name": "terminate",
            "type": "bool"
          },
          {
            "name": "kinetics",
            "type": "bytes32"
          },
          {
            "name": "dynamics",
            "type": "bytes32"
          }
        ],
        "name": "pharmadetails",
        "outputs": [
          {
            "name": "rpid",
            "type": "uint128"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "volid",
            "type": "bytes32"
          },
          {
            "name": "seriousness",
            "type": "bytes32"
          },
          {
            "name": "expectedness",
            "type": "bytes32"
          },
          {
            "name": "relatedness",
            "type": "bytes32"
          }
        ],
        "name": "setPi",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "vname",
            "type": "bytes32"
          },
          {
            "name": "vcontact",
            "type": "uint128"
          },
          {
            "name": "vdob",
            "type": "bytes32"
          },
          {
            "name": "vg",
            "type": "bytes32"
          },
          {
            "name": "vw",
            "type": "uint128"
          },
          {
            "name": "vh",
            "type": "uint128"
          },
          {
            "name": "vr",
            "type": "bytes32"
          },
          {
            "name": "vs",
            "type": "bool"
          },
          {
            "name": "vallergy",
            "type": "bytes32"
          },
          {
            "name": "vmedic",
            "type": "bytes32"
          },
          {
            "name": "light",
            "type": "bytes32"
          },
          {
            "name": "pharmacologist",
            "type": "bytes32"
          }
        ],
        "name": "RegisterVolunteer",
        "outputs": [
          {
            "name": "id",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "volid",
            "type": "bytes32"
          }
        ],
        "name": "getPi",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "hyp",
            "type": "bytes32"
          },
          {
            "name": "drug",
            "type": "bytes32"
          },
          {
            "name": "dose",
            "type": "bytes32"
          },
          {
            "name": "vc",
            "type": "uint128"
          },
          {
            "name": "criteria",
            "type": "bytes32"
          },
          {
            "name": "pname",
            "type": "bytes32"
          }
        ],
        "name": "setcro",
        "outputs": [
          {
            "name": "tid",
            "type": "uint128"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "j",
            "type": "bytes32"
          }
        ],
        "name": "getvolunteer",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "uint128"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "uint128"
          },
          {
            "name": "",
            "type": "uint128"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "j",
            "type": "uint256"
          }
        ],
        "name": "getvolunteernew",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "volid",
            "type": "bytes32"
          }
        ],
        "name": "getMi",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "volid",
            "type": "bytes32"
          },
          {
            "name": "effectiveness",
            "type": "bytes32"
          },
          {
            "name": "sideeffects",
            "type": "bytes32"
          },
          {
            "name": "testsuccess",
            "type": "bytes32"
          }
        ],
        "name": "setMi",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "n",
            "type": "bytes32"
          }
        ],
        "name": "pharma",
        "outputs": [
          {
            "name": "pid",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "id",
            "type": "uint128"
          }
        ],
        "name": "getcro",
        "outputs": [
          {
            "name": "",
            "type": "uint128"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "uint128"
          },
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "type": "constructor"
      }
    ],
    "unlinked_binary": "0x606060405234610000575b60038054600160a060020a03191633600160a060020a03161790555b5b6108bb806100366000396000f300606060405236156100a95763ffffffff60e060020a600035041663077fb79681146100ae57806331abf0e1146100e35780634c93d54614610119578063636cc6f9146101695780638554d0fc14610184578063948ebce9146101de578063ba75ddcc1461020c578063bcfe7db914610250578063be498ad8146102d6578063cfb27fcd146102f8578063d99fb59514610326578063ea44df1114610341578063f0878bcb14610363575b610000565b34610000576100c76001608060020a03600435166103c7565b604080516001608060020a039092168252519081900360200190f35b34610000576100f06103ed565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b34610000576100c76004356001608060020a036024351660443560643560843560a43560c435151560e43561010435610409565b604080516001608060020a039092168252519081900360200190f35b34610000576101826004356024356044356064356104a9565b005b34610000576101cc6004356001608060020a03602435811690604435906064359060843581169060a4351660c43560e4351515610104356101243561014435610164356104d7565b60408051918252519081900360200190f35b34610000576101ee60043561064f565b60408051938452602084019290925282820152519081900360600190f35b34610000576100c76004356024356044356001608060020a036064351660843560a43561067a565b604080516001608060020a039092168252519081900360200190f35b3461000057610260600435610702565b604080519c8d526001608060020a039b8c1660208e01528c81019a909a5260608c019890985295891660808b01529390971660a089015260c0880191909152151560e087015261010086019490945261012085019390935261014084019290925261016083019190915251908190036101800190f35b34610000576101cc600435610799565b60408051918252519081900360200190f35b34610000576101ee6004356107b6565b60408051938452602084019290925282820152519081900360600190f35b34610000576101826004356024356044356064356107e1565b005b34610000576101cc60043561080f565b60408051918252519081900360200190f35b346100005761037c6001608060020a0360043516610837565b604080516001608060020a03988916815260208101979097528681019590955260608601939093529416608084015260a083019390935260c082019290925290519081900360e00190f35b6001608060020a0380821660009081526020819052604090208054909116905b50919050565b60035473ffffffffffffffffffffffffffffffffffffffff1681565b600f80546001608060020a03808216600181810183166fffffffffffffffffffffffffffffffff199485161790945560008181526002602081905260409091208e81559485018054938e169390941692909217909255820189905560038201889055600482018790556005820186905560068201805486151560ff199091161790556007820184905560088201839055905b509998505050505050505050565b6000848152600c602052604090208481556001810184905560028101839055600381018290555b5050505050565b60006000600084600b816000191690555060086000600b5460001916600019168152602001908152602001600020915060096000600a54815260200190815260200160002090508e8260000181600019169055508d8260010160006101000a8154816001608060020a0302191690836001608060020a031602179055508c8260020181600019169055508b8260030181600019169055508a8260040160006101000a8154816001608060020a0302191690836001608060020a03160217905550898260040160106101000a8154816001608060020a0302191690836001608060020a0316021790555088826005018160001916905550878260060160006101000a81548160ff021916908315150217905550868260070181600019169055508582600801816000191690555084826009018160001916905550848160090181600019169055508382600a018160001916905550600a600081548092919060010191905055505b50509c9b505050505050505050505050565b6000818152600c6020526040902060018101546002820154600383015491929091905b509193909250565b600780546001608060020a03808216600181810183166fffffffffffffffffffffffffffffffff1994851617909455600081815260208190526040902080548416821781559384018a9055600284018990556003840188905560048401805492881692909316919091179091556005820184905560068201839055905b509695505050505050565b6000818152600860208190526040909120600a810154600e819055815460018301546002840154600385015460048601546005870154600688015460078901549989015460098a0154979a6001608060020a039788169a969995988589169870010000000000000000000000000000000090960490951696939560ff909316949093919290915b5091939597999b5091939597999b565b600081815260096020819052604090912090810154905b50919050565b6000818152600d6020526040902060018101546002820154600383015491929091905b509193909250565b6000848152600d602052604090208481556001810184905560028101839055600381018290555b5050505050565b6005805460018082019092556000818152602083905260409020918201839055905b50919050565b6001608060020a03808216600090815260208190526040902080546001820154600283015460038401546004850154600586015460068701549588169794969395929491909116929091905b509193959790929496505600a165627a7a723058203c628fcb48ffb08ebac6c1b962b6abb9771d7ae45e58322b09dface0939598550029",
    "events": {},
    "updated_at": 1507277548618,
    "links": {},
    "address": "0x326c2ae4942286e83e6e969f84b2f4915c15d099"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "Clinictrial";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.Clinictrial = Contract;
  }
})();
