<template lang="pug">
    v-form(ref='form' v-model='valid' lazy-validation='')
      v-row
        v-col(md="6" offset-md="2")
            div ล็อกอิน

            v-text-field(
                label="Username"
                v-model="userid"
                :rules='[rules.required]'
                required
            )

            v-text-field.input-group--focused(
                v-model='password'
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" 
                :rules='[rules.required]' 
                :type="show ? 'text' : 'password'" 
                label='Password'
                @click:append='show = !show'
                required
                )

            v-select(
                v-model='usertype' 
                :items='usertypes' 
                :rules='[rules.required]'
                label='ประเภท' 
                required
                )

            v-btn(color="success" @click="login" ) ล็อกอิน

</template>

<script>
import { mapState } from "vuex";

export default {
  name: "login",
  data() {
    return {
        valid: false,
        show: false,
        rules: {
            required: value => !!value || 'Required.'
        },
        usertypes: [
            'doctor',
            'patient'
        ],
        userid: "",
        password: "",
        usertype: null
    };
  },
  methods: {

    async login() {
      const vm = this;
      const userid = vm.userid;
      let usertype = vm.usertype;
      const password = vm.password

      const res = await vm.$store.dispatch("login", {
        userid: userid,
        password: password,
        usertype : usertype
      });

        if(userid == 'admin'){
            usertype = 'admin'
        }

        if(res == true){
            localStorage.setItem('currentUser', JSON.stringify({
                userid: userid,
                password: password,
                usertype : usertype
            }));
            await vm.$router.push({ path: "/" });
            await vm.$router.go()
        }else{
            await vm.$router.push({ path: "/register" });
        }
    },
  }
};
</script>