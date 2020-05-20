'use strict';
const express = require('express');
const utils = require('./utils.js');
const chainRouter = express.Router();

const STATUS_SUCCESS = 200;
const STATUS_CLIENT_ERROR = 400;
const STATUS_SERVER_ERROR = 500;

//  USER Management Errors
const USER_NOT_ENROLLED = 1000;
const INVALID_HEADER = 1001;

const Profile = require('../chaincode/nodejs/libs/profile');


//  application specific errors
const SUCCESS = 0;
const ORDER_NOT_FOUND = 2000;


async function bypassUser(request){
  
    request.username = 'admin';
    request.password = 'adminpw';


    return request;
}

async function getUsernamePassword(request) {


    if (!request.headers.authorization === -1) {
        return new Promise().reject('Missing Authorization Header');  //  status 401
    }
   
    const credentials = request.headers.authorization



    const [username, password] = credentials.split(':');

    

    if (!username || !password) {
        return new Promise().reject('Invalid Authentication Credentials');  //  status 401
    }

    request.username = username;
    request.password = password;
    //request.username = 'admin';
    //request.password = 'adminpw';

    return request;
   
}

async function submitTx(request, txName, ...args) {

    try {
        //  check header; get username and pwd from request
        //  does NOT verify auth credentials
        await getUsernamePassword(request);
        return utils.setUserContext(request.username, request.password).then((contract) => {
            // Insert txName as args[0]
            args.unshift(txName);   
            args.unshift(contract);

    
            // .apply applies the list entries as parameters to the called function
            return utils.submitTx.apply("unused", args)
                .then(buffer => {
                    return buffer;
                }, error => {
                    return Promise.reject(error);
                });
        }, error => {
            return Promise.reject(error);
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
}

chainRouter.route('/auth').post(function (request, response) {
    getAuth(request)
});



chainRouter.route('/patients').post(function (request, response) {

    submitTx(request, 'addPatient', JSON.stringify(request.body))
        .then((result) => {
            // process response
            console.log('\nProcess addPatient transaction.');
            let profile = Profile.fromBuffer(result);
            console.log(`profile ${profile.profileId} : age = ${profile.price}, state = ${profile.currentProfileState}`);
           // let order = Order.fromBuffer(result);
           // console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
            
            response.send(profile).status(SUCCESS);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem placing the profile."));
        });
});



chainRouter.route('/patients').get(function (request, response) {
    submitTx(request, 'queryAllPatients', '')
        .then((queryPatientResponse) => {
            //  response is already a string;  not a buffer
            let patients = queryPatientResponse;
            response.send(patients).status(STATUS_SUCCESS);
            
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem getting the list of patients."));
        });
});  //  process route orders/

chainRouter.route('/patients').patch(function (request, response) {
    submitTx(request, 'updatePatient', JSON.stringify(request.body))
        .then((result) => {
            // process response
            console.log('\nProcess addPatient transaction.');
            let profile = Profile.fromBuffer(result);
            console.log(`profile ${profile.profileId} : age = ${profile.price}, state = ${profile.currentProfileState}`);
           // let order = Order.fromBuffer(result);
           // console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);

            response.send(profile).status(SUCCESS);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem placing the profile."));
        });
});


chainRouter.route('/patients/:id').get(function (request, response) {
    submitTx(request, 'queryPatient', request.params.id)
        .then((queryPatientResponse) => {
            // process response
            let profile = Profile.fromBuffer(queryPatientResponse);
            console.log(`profile ${profile.profileId} : age = ${profile.age}, state = ${profile.currentProfileState}`);
            response.send(profile).status(STATUS_SUCCESS);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, ORDER_NOT_FOUND,
                'Profile id, ' + request.params.id +
                ' does not exist or the user does not have access to profile details at this time.'));
        });
});

chainRouter.route('/patients/:id').delete(function (request, response) {
    submitTx(request, 'deletePatient', request.params.id)
        .then((deletePatientResponse) => {
            // process response
            console.log('Process DeletePatient transaction.');
            console.log('Transaction complete.');
            response.send(deletePatientResponse).status(STATUS_SUCCESS);;
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem in deleting order, " + request.params.id));
        });
});


chainRouter.route('/users').get(function (request, response) {
    getUsernamePassword(request)
    .then(request => {
        utils.getAllUsers(request.username).then((result) => {
            response.status(STATUS_SUCCESS);
            response.send(result);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse (error, STATUS_SERVER_ERROR,
                "Problem getting list of users."));
        });
    }, ((error) => {
        response.status(STATUS_CLIENT_ERROR);
        response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
            "Invalid header;  User, " + request.username + " could not be enrolled."));
    }));
});

chainRouter.route('/users/:id').get(function (request, response) {
    //  Get admin username and pwd from request header
    //  Only admin can call this api; this is not verified here;
    //  Possible future enhancement
    getUsernamePassword(request)
        .then(request => {
            utils.isUserEnrolled(request.params.id).then(result1 => {
                if (result1 == true) {
                    utils.getUser(request.params.id, request.username).then((result2) => {
                        response.status(STATUS_SUCCESS);
                        response.send(result2);
                    }, (error) => {
                        response.status(STATUS_SERVER_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                            "Could not get user details for user, " + request.params.id));
                    });
                } else {
                    let error = {};
                    response.status(STATUS_CLIENT_ERROR);
                    response.send(utils.prepareErrorResponse(error, USER_NOT_ENROLLED,
                        "Verify if the user is registered and enrolled."));
                }
            }, error => {
                response.status(STATUS_SERVER_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                    "Problem checking for user enrollment."));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header;  User, " + request.params.id + " could not be enrolled."));
        }));
});

chainRouter.route('/is-user-enrolled/:id').get(function (request, response) {
    //  only admin can call this api;  But this is not verified here
    //  get admin username and pwd from request header
    //
    getUsernamePassword(request)
        .then(request => {
            let userId = request.params.id;
            utils.isUserEnrolled(userId).then(result => {
                response.send(result).status(STATUS_SUCCESS);;
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                  "Error checking enrollment for user, " + request.params.id));
            });
        }, ((error) => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                "Invalid header; Error checking enrollment for user, " + request.params.id));
        }));
})

chainRouter.route('/register-user').post(function (request, response) {
    try {
        let userId = request.body.userid;
        let userPwd = request.body.password;
        let userType = request.body.usertype;

        //  only admin can call this api;  get admin username and pwd from request header
        bypassUser(request)
            .then(request => {
                //  1.  No need to call setUserContext
                //  Fabric CA client is used for register-user;
                //  2.  In this demo application UI, only admin sees the page "Manage Users"
                //  So, it is assumed that only the admin has access to this api
                //  register-user can only be called by a user with admin privileges.

                utils.registerUser(userId, userPwd, userType, request.username).
                    then((result) => {
                        response.send(result).status(STATUS_SUCCESS);
                    }, (error) => {
                        response.status(STATUS_CLIENT_ERROR);
                        response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                            "User, " + userId + " could not be registered. "
                            + "Verify if calling identity has admin privileges."));
                    });
            }, error => {
                response.status(STATUS_CLIENT_ERROR);
                response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
                    "Invalid header;  User, " + userId + " could not be registered."));
            });
    } catch (error) {
        response.status(STATUS_SERVER_ERROR);
        response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
            "Internal server error; User, " + userId + " could not be registered."));
    }
});

chainRouter.route('/enroll-user').post(function (request, response) {
    let userId = request.body.userid;
    let userPwd = request.body.password;
    let userType = request.body.usertype;
    //  retrieve username, password of the called from authorization header
    bypassUser(request).then(request => {
        utils.enrollUser(userId, userPwd, userType).then(result => {
            response.send(result).status(STATUS_SUCCESS);
        }, error => {
            response.status(STATUS_CLIENT_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_CLIENT_ERROR,
                "User, " + userId + " could not be enrolled. Check that user is registered."));
        });
    }), (error => {
        response.status(STATUS_CLIENT_ERROR);
        response.send(utils.prepareErrorResponse(error, INVALID_HEADER,
            "Invalid header;  User, " + userId + " could not be enrolled."));
    });
});


chainRouter.route('/check-patient').post(function (request, response) {
    submitTx(request, 'checkPatient', JSON.stringify(request.body))
        .then((result) => {
            // process response
            console.log('\nProcess checkPatient transaction.');
          //  let profile = Profile.fromBuffer(result);
           // console.log(`profile ${profile.profileId} : age = ${profile.price}, state = ${profile.currentProfileState}`);
           // let order = Order.fromBuffer(result);
           // console.log(`order ${order.orderId} : price = ${order.price}, quantity = ${order.quantity}, producer = ${order.producerId}, consumer = ${order.retailerId}, trackingInfo = ${order.trackingInfo}, state = ${order.currentOrderState}`);
            
            response.send(result).status(SUCCESS);
        }, (error) => {
            response.status(STATUS_SERVER_ERROR);
            response.send(utils.prepareErrorResponse(error, STATUS_SERVER_ERROR,
                "There was a problem placing the profile."));
        });
    
});


module.exports = chainRouter;