/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate Profile state values
const profileState = {
    PROFILE_CREATED: 1,       // Retailer
    PROFILE_IN_TRANSIT: 2,      // Producer
    PROFILE_RECEIVED: 3,   // Retailer
    PROFILE_DELETED : 4,
    PROFILE_CLOSED: 5,   // Not currently used
    PROFILE_UPDATED: 6
};

/**
 * Profile class extends State class
 * Class will be used by application and smart contract to define a Profile
 */
class Profile extends State {

    constructor(obj) {
        super(Profile.getClass(), [obj.profileId]);
        Object.assign(this, obj);
    }

    /*
    Definition:  Class Profile:
      {String}  ProfileId
      {String} productId
      {float}   price
      {Integer} quantity
      {String} producerId
      {String} shipperId
      {String} retailerId
      {Enumerated ProfileStates} currentProfileState
      {String} modifiedBy
    */

    /**
     * Basic getters and setters
    */
    getId() {
        return this.profileId;
    }
/*  //  should never be called explicitly;
    //  id is set at the time of constructor call.
    setId(newId) {
        this.id = newId;
    }
*/
    /**
     * Useful methods to encapsulate  Profile states
     */
    setStateToProfileCreated() {
        this.currentProfileState = profileState.PROFILE_CREATED;

    }

    setStateToProfileReceived() {
        this.currentProfileState = profileState.PROFILE_RECEIVED;
    }

    setStateToProfileInTransit() {
        this.currentProfileState = profileState.PROFILE_IN_TRANSIT;
    }

    setStateToProfileDeleted() {
        this.currentProfileState = profileState.PROFILE_DELETED;
    }

    setStateToProfileClosed() {
        this.currentProfileState = profileState.PROFILE_CLOSED;
    }

    setStateToProfileUpdated() {
        this.currentProfileState = profileState.PROFILE_UPDATED;
    }

    static fromBuffer(buffer) {
        return Profile.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to  Profile
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Profile);
    }

    /**
     * Factory method to create a Profile object
     */
    static createInstance(profileId) {
        return new Profile({profileId});
    }

    static getClass() {
        return 'org.chainnet.profile';
    }
}

module.exports = Profile;
module.exports.profileStates = profileState;
