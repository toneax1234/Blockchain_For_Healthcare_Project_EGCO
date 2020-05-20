import Vue from 'vue'
import Vuex from 'vuex'
import * as moment from 'moment';

const baseURL = `http://localhost:3000/api`

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        raw_patient: [],
    },
    mutations: {

    },
    actions: {
      /*  async fetchpatientTypes({ state }) {

            const response = await fetch(`${baseURL}/patienttypes`)
            const patientTypes = await response.json()

            state.raw_resource_types = [{ id: 0, name: "Please Select Type" }].concat(patientTypes || [])

            return null;
        },*/

        async fetchpatient({ state }) {

            let currentUser = await JSON.parse(localStorage.getItem('currentUser'))
            

            const response = await fetch(`${baseURL}/patients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })
            
            let patients = await response.json()

            console.log(patients)


            state.raw_patient = patients || []

            return null;
        },
        async get({ state }, id) {
            
            let currentUser = await JSON.parse(localStorage.getItem('currentUser'))

            const response = await fetch(`${baseURL}/patients/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })
            let patient = await response.json()


            return patient;
        },
        async create({ state }, new_patient) {

            let currentUser = await JSON.parse(localStorage.getItem('currentUser'))
            let id = new_patient.profileId

        
            const response = await fetch(`${baseURL}/check-patient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
                body: JSON.stringify(new_patient)
            })

            let status = await response.json()

            
           if(status == false){

           let user_exist =  await fetch(`${baseURL}/is-user-enrolled/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })

            user_exist =  await user_exist.json()


            if(user_exist != true){
                return null
            }

            }


            const response2 = await fetch(`${baseURL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
                body: JSON.stringify(new_patient)
            })

            let newpatient = await response2.json()

           


            return new_patient
        },
        async delete({ state }, id) {

            let currentUser = await JSON.parse(localStorage.getItem('currentUser'))

            const response = await fetch(`${baseURL}/patients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })

            return Promise.resolve();
        },

        async update({ state }, { data }) {

            let currentUser = await JSON.parse(localStorage.getItem('currentUser'))

            const response = await fetch(`${baseURL}/patients`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
                body: JSON.stringify(data)
            })

            let newpatient = response.json()
            
            return newpatient
        },
        async fetchAllUsers({ state }) {

           let currentUser = await JSON.parse(localStorage.getItem('currentUser'))
           let id;

            let response = await fetch(`${baseURL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })

            let user = await response.json()

        
            
            
            for(let i=0;i<user.length;i++){
                id = user[i].id
                const response2 =  await fetch(`${baseURL}/is-user-enrolled/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : `${currentUser.userid}:${currentUser.password}`
                    },
                })
                let enrollStatus =  await response2.json()
                user[i].enrollStatus =  enrollStatus
            }
            
            //user = await user.json();
            state.raw_user = user || []
            
            
            return null;
        },
        async fetchUser({ state } ) {

            let id = 'admin';
            const response = await fetch(`${baseURL}/users/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${currentUser.userid}:${currentUser.password}`
                },
            })
            let user = await response.json()


            return user;
        },
        async register({ state } , registerData) {


            

            const response = await fetch(`${baseURL}/register-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            })


            return null;
        },
        async enroll({ state } , enrollData) {

            const response = await fetch(`${baseURL}/enroll-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrollData)
            })

            return null;
        },
        async regisenroll({ state } , registerData) {

            

            const response = await fetch(`${baseURL}/register-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            })

            const response2 = await fetch(`${baseURL}/enroll-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            })
            
            return null;
        },
        async login({ state } , loginData) {

            let login;

            const response = await fetch(`${baseURL}/enroll-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${loginData.userid}:${loginData.password}`
                },
                body: JSON.stringify(loginData)
            }).then((result) => {
                // process response
               if(result.status == 200){
                   login = true
                   return login;
               }else{
                   login = false
                   return login
               }
            }, (error) => {
                return null
            });

            return login;
        }
        

    }
})
