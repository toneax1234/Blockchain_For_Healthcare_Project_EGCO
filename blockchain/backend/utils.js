/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, User, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml')

// capture network variables from config.json
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var connection_file = config.connection_file;
var appAdmin = config.appAdmin;
var appAdminSecret = config.appAdminSecret;
var userName = config.userName;
var orgMSPID = config.orgMSPID;
var caName = config.caName;
var gatewayDiscovery = config.gatewayDiscovery;
const walletPath = path.join(process.cwd(), 'wallet');
var wallet = new FileSystemWallet(walletPath);
var bLocalHost = true;
var contract = null;
var network;
var gateway;
var caURL = config.caURL;

const EVENT_TYPE = "bcpocevent";  //  HLFabric EVENT

const SUCCESS = 0;
const utils = {};


const filePath = path.join(process.cwd(), './connection.yaml');
let fileContents = fs.readFileSync(filePath, 'utf8');
let connectionFile = yaml.safeLoad(fileContents);
//console.log(connectionFile)


utils.prepareErrorResponse = (error, code, message) => {

    let errorMsg;
    try {
        // Pull specific fabric transaction error message out of error stack
        let entries = Object.entries(error);
        errorMsg = entries[0][1][0]["message"];
    } catch (exception) {
        // Error wasn't sent from fabric, so can't pull error out.
        errorMsg = null;
    }

    let result = { "code": code, "message": errorMsg?errorMsg:message, "error": error };
    console.log("utils.js:prepareErrorResponse(): " + message);
    console.log(result);
    return result;
}

utils.connectGatewayFromConfig = async () => {
    console.log(">>>connectGatewayFromConfig:  ");

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();
    try {

        //console.log(caName)
        // Create a new CA client for interacting with the CA.
       // console.log(caURL)
        const ca = new FabricCAServices(caURL);
       // console.log(caName)
        // Create a new file system based wallet for managing identities.

        // Check to see if we've already enrolled the admin user.

        var userid = config.appAdmin;
        var pwd = config.appAdminSecret;
        var usertype = config.appAdmin;

        const idExists = await wallet.exists(userid);
        if (!idExists) {
            // Enroll identity in the wallet
            console.log(`Enrolling and importing ${userid} into wallet`);
            await utils.enrollUser(userid, pwd, usertype);
        }

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(connectionFile, { wallet: wallet, identity: userName, discovery: { enabled: false, asLocalhost: bLocalHost } });

        //gateway connect
       

        console.log('Use network channel: ' + config.channel_name);
        network = await gateway.getNetwork(config.channel_name);

        console.log('Use Contract : ' +config.smart_contract_name+  ' smart contract')
        contract = await network.getContract(config.smart_contract_name);

    } catch (error) {
        console.error('Error connecting to Fabric network. ' + error.toString());
    } finally {
    }
    return contract;
}

utils.events = async () => {
    // get an eventhub once the fabric client has a user assigned. The user
    // is required because the event registration must be signed

    //  Eventhub is attached to a peer.  Get the peer, to register an event hub.
    //  client -> channel -> peer -> eventHub

    const client = gateway.getClient();
    console.log('get even from channel : ' + config.channel_name)
    var channel = client.getChannel(config.channel_name);
    var peers = channel.getChannelPeers();


   // var setting = getChaincodeSetting(channel)

    //console.log(setting)
  /*  var info = await channel.initialize({
        discover: true
    });*/

   // console.log(info)

    /*var endorse = await channel.getDiscoveryResults({
        interests: [
          { chaincodes: [{ name: "profilecontract"}]}

        ]
      })*/

   // console.log(endorse)

   // console.log(peers)
   /*await channel.queryBlock(2).then((block) => {
    console.log('Block Number: ' + block.header.number);
    console.log('Previous Hash: ' + block.header.previous_hash);
    console.log('Data Hash: ' + block.header.data_hash);
    // console.log('Transactions: ' + block.data.data.length);
     block.data.data.forEach(transaction => {
      // console.log('Transaction ID: ' + transaction.payload.header.channel_header.tx_id);
      // console.log('Creator ID: ' + transaction.payload.header.signature_header.creator.Mspid);
       //console.log('Data: ');
       //console.log(JSON.stringify(transaction.payload.data));
     });
   });*/





    if (peers.length == 0) {
        throw new Error("Error after call to channel.getChannelPeers(): Channel has no peers !");
    }

    console.log("Connecting to event hub..." + peers[0].getName());
    //  Assuming that we want to connect to the first peer in the peers list
    var channel_event_hub = channel.getChannelEventHub(peers[0].getName());

   // console.log(channel_event_hub)

    // to see the event payload, use 'true' in the call to channel_event_hub.connect(boolean)
    channel_event_hub.connect(true);

    let event_monitor = new Promise((resolve, reject) => {
        /*  Sample usage of registerChaincodeEvent
        registerChaincodeEvent ('chaincodename', 'regularExpressionForEventName',
               callbackfunction(...) => {...},
               callbackFunctionForErrorHandling (...) => {...},
               // options:
               {startBlock:23, endBlock:30, unregister: true, disconnect: true}
        */
        var regid = channel_event_hub.registerChaincodeEvent(config.smart_contract_name, EVENT_TYPE,
            (event, block_num, txnid, status) => {
                // This callback will be called when there is a chaincode event name
                // within a block that will match on the second parameter in the registration
                // from the chaincode with the ID of the first parameter.

                //let event_payload = JSON.parse(event.payload.toString());

                console.log("Event payload: " + event.payload.toString());
                console.log("\n------------------------------------");
            }, (err) => {
                // this is the callback if something goes wrong with the event registration or processing
                reject(new Error('There was a problem with the eventhub in registerTxEvent ::' + err));
            },
            { disconnect: false } //continue to listen and not disconnect when complete
        );
    }, (err) => {
        console.log("At creation of event_monitor: Error:" + err.toString());
        throw (err);
    });

    Promise.all([event_monitor]);
}  //  end of events()


utils.submitTx = async(contract, txName, ...args) => {
    console.log(">>>utils.submitTx..."+txName+" ("+args+")");
    let result = contract.submitTransaction(txName, ...args);
    return result.then (response => {
        // console.log ('Transaction submitted successfully;  Response: ', response.toString());
        console.log ('utils.js: Transaction submitted successfully');
        return Promise.resolve(response.toString());
    },(error) =>
        {
          console.log ('utils.js: Error:' + error.toString());
          return Promise.reject(error);
        });
}

utils.registerUser = async (userid, userpwd, usertype, adminIdentity) => {
    console.log("\n------------  utils.registerUser ---------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype: " + usertype)

    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(connectionFile, { wallet: wallet, identity: userName, discovery: { enabled: false, asLocalhost: bLocalHost } });
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    var newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role: "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
        maxEnrollments: -1
    };

    //  Register is done using admin signing authority
    return ca.register(newUserDetails, gateway.getCurrentIdentity())
        .then(newPwd => {
            //  if a password was set in 'enrollmentSecret' field of newUserDetails,
            //  the same password is returned by "register".
            //  if a password was not set in 'enrollmentSecret' field of newUserDetails,
            //  then a generated password is returned by "register".
            console.log('\n Secret returned: ' + newPwd);
            return newPwd;
        }, error => {
            console.log('Error in register();  ERROR returned: ' + error.toString());
            return Promise.reject(error);
        });
}  //  end of function registerUser

utils.enrollUser = async (userid, userpwd, usertype) => {
    console.log("\n------------  utils.enrollUser -----------------");
    console.log("userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certificate authority
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });

    var newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        attrs: [
            {
                "name": "usertype", // application role
                "value": usertype,
                "ecert": true
            }]
    };

    return ca.enroll(newUserDetails).then(enrollment => {
        //console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);
        var identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        return wallet.import(userid, identity).then(notused => {
            return console.log('msg: Successfully enrolled user, ' + userid + ' and imported into the wallet');
        }, error => {
            console.log("error in wallet.import\n" + error.toString());
            throw error;
        });
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}

utils.setUserContext = async (userid, pwd) => {
    console.log('\n>>>setUserContext...');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log("An identity for the user: " + userid + " does not exist in the wallet");
        console.log('Enroll user before retrying');
        throw ("Identity does not exist for userid: " + userid);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway with userid:' + userid);
        let userGateway = new Gateway();
        await userGateway.connect(connectionFile, { wallet: wallet, identity: userid, discovery: { enabled: true, asLocalhost: true } });
       
        network = await userGateway.getNetwork('mainchannel');
        console.log('yoooooooooooooooooooooooooooooooooooooooo')
        contract = await network.getContract(config.smart_contract_name);
        
       
        return contract;
    }
    catch (error) { throw (error); }
}  //  end of setUserContext(userid)

utils.pullContract = async () => {
    contract = await network.getContract(config.smart_contract_name);
    consolg.log('PullContract !!')
    return contract;
}

utils.isUserEnrolled = async (userid) => {
    return wallet.exists(userid).then(result => {
        return result;
    }, error => {
        console.log("error in wallet.exists\n" + error.toString());
        throw error;
    });
}

utils.getUser = async (userid, adminIdentity) => {
    console.log(">>>getUser... as : " + adminIdentity);
    const gateway = new Gateway();
    // Connect to gateway as admin
    await gateway.connect(connectionFile, { wallet: wallet, identity: adminIdentity, discovery: { enabled: false, asLocalhost: bLocalHost } });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = await idService.getOne(userid, gateway.getCurrentIdentity());
    let result = {"id": userid};

    // for admin, usertype is "admin";
    if (userid == "admin") {
        result.usertype = userid;
    } else { // look through user attributes for "usertype"
        let j = 0;
        while (user.result.attrs[j].name !== "usertype") j++;
            result.usertype = user.result.attrs[j].value;
    }
    console.log (result);
    return Promise.resolve(result);
}  //  end of function getUser

utils.getAllUsers = async (adminIdentity) => {

    console.log(">>>getAllUsers... As : "+ adminIdentity)
    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(connectionFile, { wallet : wallet, identity: adminIdentity, discovery: { enabled: true, asLocalhost: bLocalHost } });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    let userList = await idService.getAll(user);
    let identities = userList.result.identities;
    let result = [];
    let tmp;
    let attributes;

    // for all identities
    for (var i = 0; i < identities.length; i++) {
        tmp = {};
        tmp.id = identities[i].id;
        tmp.usertype = "";

        if (tmp.id == "admin")
            tmp.usertype = tmp.id;
        else {
            attributes = identities[i].attrs;
            // look through all attributes for one called "usertype"
            for (var j = 0; j < attributes.length; j++)
                if (attributes[j].name == "usertype") {
                    tmp.usertype = attributes[j].value;
                    break;
                }
        }

        if(tmp.usertype.length >= 1){
            result.push(tmp);
        }
        
    }
    return result;
}  //  end of function getAllUsers


utils.getRandomNum = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return `${s4()}${s4()}${s4()}${s4()}`
}

module.exports = utils;