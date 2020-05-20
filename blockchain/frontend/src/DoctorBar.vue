<template lang="pug">
  
    div
        v-toolbar
            v-toolbar-title โรงพยาบาล A
            v-toolbar-items
                v-btn(text to="/") หน้าหลัก
                v-btn(text to="/create") เพิ่มผู้ป่วย
                v-btn(text to="/regisenroll") สมัครสมาชิก
                v-btn(text @click="logout") logout
            v-toolbar-title Doctor
        
        v-app
            v-container(fluid)
                router-view

</template>

<script>
export default {
  name: "DoctorBar",
  data: () => ({
    //
  }),
  methods: {
    async logout() {
      const vm = this;
      localStorage.setItem('currentUser', JSON.stringify({
                userid: '',
                password: '',
                usertype : ''
      }));

      await vm.$router.push({ path: "/login" });
      await vm.$router.go()
    }
  }
};
</script>

<style scoped>

</style>
