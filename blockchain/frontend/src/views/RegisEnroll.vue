<template lang="pug">
    v-form(ref='form' v-model='valid' lazy-validation='')
      v-row
        v-col(md="6" offset-md="2")

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

            v-btn(color="success" @click="regisenroll" ) ยืนยันการสมัคร

</template>

<script>
import { mapState } from "vuex";

export default {
  name: "regisenroll",
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

    async regisenroll() {
      const vm = this;
      await vm.$store.dispatch("regisenroll", {
        userid: vm.userid,
        password: vm.password,
        usertype : vm.usertype
      });

      vm.$router.push({ path: "/" });
    }
  },
  computed: {
     
  },
  mounted(){
    const vm = this;
  }
};
</script>