'use strict';
const { Contract, Context} = require('fabric-contract-api');
const shim = require('fabric-shim');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Profile = require('./profile.js');
const ProfileStates = require('./profile.js').profileStates;
const EVENT_TYPE = "bcpocevent";


class ProfilechainContext extends Context {
    constructor() {
        super();
    }
}

class ProfileContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.chainnet.contract');
    }

    createContext() {
        return new ProfilechainContext();
    }

    async init(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the profilecontract contract');
        return shim.success(Buffer.from("init chaincode success"));
    }

    /*async queryPatient(ctx,patientId) {
   
    let dataAsBytes = await ctx.stub.getState(patientId); 
    if (!dataAsBytes || dataAsBytes.toString().length <= 0) {
      throw new Error('patient with this Id does not exist: ');
       }
      let data=JSON.parse(dataAsBytes.toString());
      
      return JSON.stringify(data);
     }*/


    async addPatient(ctx,args) {

        let userType = await this.getCurrentUserType(ctx);
        const cid = new ClientIdentity(ctx.stub);
        const org = await cid.getMSPID();
        const profile_details = JSON.parse(args);
        const profileId = profile_details.profileId;

        let profileOldAsByte = await ctx.stub.getState(profileId);
        let profileOldJSON = profileOldAsByte.toString()

      

    
        console.log("addPatinet executed");

        if ((userType != "admin") && (userType != "doctor")){
            throw new Error(`This user does not have access to create an order`);
        }

        

        console.log("incoming asset fields: " + JSON.stringify(profile_details));
   
        let profile =  Profile.createInstance(profileId);
        profile.age = profile_details.age.toString();
        profile.participants = []
        profile.org = []
        profile.org.push(org)
        
       // profile.byte = profileOldJSON.length
        
    

        profile.modifiedBy = await this.getCurrentUserId(ctx);

        if(userType != 'admin'){
            profile.participants.push('admin')
        }

        profile.participants.push(profile.modifiedBy)
        profile.currentProfileState = ProfileStates.PROFILE_CREATED;



        if(profileOldJSON.length > 0){
            let profileOld = await JSON.parse(profileOldJSON)
            profile.participants = profile.participants.concat(profileOld.participants)
            profile.org = profile.org.concat(profileOld.org)
        }

        //profile.old = await JSON.parse(profileOldJSON)

        profile.org =  [...new Set(profile.org)];
        profile.participants = [...new Set(profile.participants)]

        if(parseInt(profile.age) <= 0){
          return shim.error("Age can't be negative !!");
        }

        const event_obj = profile;
        event_obj.event_type = "createProfile";


        await ctx.stub.putState(profileId, profile.toBuffer());
        console.log('profile data added To the ledger Succesfully..');


        try {
            await ctx.stub.setEvent(EVENT_TYPE, event_obj.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }
        finally {
            console.log("Attempted to send event = ", profile);
        }


        return profile.toBuffer();
    }

    async checkPatient(ctx,args){
        let status;
        const profile_details = JSON.parse(args);
        const profileId = profile_details.profileId;
        let profileOldAsByte = await ctx.stub.getState(profileId);
        let profileOldJSON = profileOldAsByte.toString()
        if(profileOldJSON.length > 0){
            status = true
        }else{
            status = false
        }
        return status;
    }

    async updatePatient(ctx,args){

        let userType = await this.getCurrentUserType(ctx);

        
        
        console.log("updatePatient executed");

        if ((userType != "admin") && (userType != "doctor")){
            throw new Error(`This user does not have access to create an order`);
        }

        const profile_details = JSON.parse(args);
        const profileId = profile_details.profileId;
        
        let profileOldAsByte = await ctx.stub.getState(profileId);
        let profileOldJSON = profileOldAsByte.toString()
        let profileOld = JSON.parse(profileOldJSON)


        console.log("incoming asset fields: " + JSON.stringify(profile_details));
   
        let profile =  Profile.createInstance(profileId);
        profile.age = profile_details.age.toString();
        profile.org = []
        profile.org = profileOld.org;
        profile.modifiedBy = await this.getCurrentUserId(ctx);
        profile.currentProfileState = ProfileStates.PROFILE_UPDATED;
        profile.participants = []
        profile.participants = profileOld.participants;


        if(parseInt(profile.age) <= 0){
          return shim.error("Age can't be negative !!");
        }

        const event_obj = profile;
        event_obj.event_type = "updateProfile";


        await ctx.stub.putState(profileId, profile.toBuffer());
        console.log('profile data updated To the ledger Succesfully..');


        try {
            await ctx.stub.setEvent(EVENT_TYPE, event_obj.toBuffer());
        }
        catch (error) {
            console.log("Error in sending event");
        }
        finally {
            console.log("Attempted to send event = ", profile);
        }


        return profile.toBuffer();
    }



    async queryAll(ctx) {

        let queryString = {
            "selector": {}
         }


         const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
         const allProfiles = [];
         while (true) {
            const profile = await iterator.next();
            if (profile.value && profile.value.value.toString()) {
                console.log(profile.value.value.toString('utf8'));

                let Record;

                try {
                    Record = JSON.parse(profile.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = profile.value.value.toString('utf8');
                }

                // Add to array of Profiles
                allProfiles.push(Record);
            }

            if (profile.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allProfiles);
                return allProfiles;
            }
        }
    }


    async queryAllPatients(ctx) {
        console.info('============= queryAllPatients ===========');

        const cid = new ClientIdentity(ctx.stub);
        const org = await cid.getMSPID();

        let userId = await this.getCurrentUserId(ctx);
        let userType = await this.getCurrentUserType(ctx);
        
        let queryString;



        //  For adding filters in query, usage: {"selector":{"producerId":"farm1"}}
        
        
       /* queryString = {
                "selector": {
                    "participants": {
                            "$elemMatch": {
                                    "$in": [userId]
                            }
                        }
                }  //  no filter;  return all orders
        }*/

        // Access control done using query strings
        switch (userType) {
            case "patient": {
                queryString = {
                    "selector": {
                        "profileId": userId
                    }
                 } //  no filter;  return all orders
                 break;
            }    
            case "admin": {
                    queryString = {
                        "selector": {
                            "org": {
                                "$elemMatch": {
                                    "$in": [org]
                                }
                            }
                        }
                    }
                    break;
            }
            case "doctor": {
                queryString = {
                    "selector" : {
                    "$and" : [
                        {
                        "participants": {
                            "$elemMatch": {
                                    "$in": [userId]
                            }
                        },
                        "org": {
                            "$elemMatch": {
                                    "$in": [org]
                            }
                        }
                     }
                  ]  //  no filter;  return all orders
                }
                }
                break;
            }  
            default: {
                return [];
            }
        }

        console.log("In queryAllPatients: queryString = ");
        console.log(queryString);
        // Get all orders that meet queryString criteria
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allProfiles = [];

        // Iterate through them and build an array of JSON objects
        while (true) {
            const profile = await iterator.next();
            if (profile.value && profile.value.value.toString()) {
                console.log(profile.value.value.toString('utf8'));

                let Record;

                try {
                    Record = JSON.parse(profile.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = profile.value.value.toString('utf8');
                }

                // Add to array of Profiles
                allProfiles.push(Record);
            }

            if (profile.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allProfiles);
                return allProfiles;
            }
        }
    }

    async queryPatient(ctx, profileId) {
        console.info('============= queryPatient ===========');

        if (profileId.length < 1) {
            throw new Error('profileId is required as input')
        }

        var profileAsBytes = await ctx.stub.getState(profileId);

        //  Set an event (irrespective of whether the profile existed or not)
        // define and set EVENT_TYPE
        let queryEvent = {
            type: EVENT_TYPE,
            profileId: profileId,
            desc: "Query profile was executed for " + profileId
        };
        await ctx.stub.setEvent(EVENT_TYPE, Buffer.from(JSON.stringify(queryEvent)));

        if (!profileAsBytes || profileAsBytes.length === 0) {
            throw new Error(`Error Message from queryOrder: Order with orderId = ${profileId} does not exist.`);
        }

        // Access Control:

        var profile = Profile.deserialize(profileAsBytes);
        //let userId = await this.getCurrentUserId(ctx);
 
       /* if ((userId != "admin") // admin only has access as a precaution.
            && (userId != order.producerId) // This transaction should only be invoked by
            && (userId != order.retailerId) //     Producer, Retailer, Shipper associated with order
            && (userId != order.shipperId))
            throw new Error(`${userId} does not have access to the details of order ${orderId}`);*/

        // Return a serialized order to caller of smart contract
        return profileAsBytes;
        //return order;
    }


    async deletePatient(ctx, profileId) {

        console.info('============= deletePatient ===========');
        if (profileId.length < 1) {
            throw new Error('Profile Id required as input')
        }
        console.log("profileId = " + profileId);

        // Retrieve the current profile using key provided
        var profileAsBytes = await ctx.stub.getState(profileId);

        if (!profileAsBytes || profileAsBytes.length === 0) {
            throw new Error(`Error Message from deletePatient: Patient with profileId = ${profileId} does not exist.`);
        }

        // Access Control: This transaction should only be invoked by designated originating Retailer or Producer
        var patient = Profile.deserialize(profileAsBytes);
       /* let userId = await this.getCurrentUserId(ctx);

        if ((userId != "admin") // admin only has access as a precaution.
            && (userId != patient.retailerId) // This transaction should only be invoked by Producer or Retailer of patient
            && (userId != patient.producerId))
            throw new Error(`${userId} does not have access to delete patient ${profileId}`);*/

        await ctx.stub.deleteState(profileId); //remove the patient from chaincode state
    }

    async getCurrentUserId(ctx) {

        let id = [];
        id.push(ctx.clientIdentity.getID());
        var begin = id[0].indexOf("/CN=");
        var end = id[0].lastIndexOf("::/C=");
        let userid = id[0].substring(begin + 4, end);
        return userid;
    }

    async getCurrentUserType(ctx) {

        let userid = await this.getCurrentUserId(ctx);

        //  check user id;  if admin, return type = admin;
        //  else return value set for attribute "type" in certificate;
        if (userid == "admin") {
            return userid;
        }
        return ctx.clientIdentity.getAttributeValue("usertype");
    }
}

module.exports= ProfileContract;