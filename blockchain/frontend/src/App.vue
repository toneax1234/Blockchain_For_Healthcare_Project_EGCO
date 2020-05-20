<template lang="pug">
  
    div
        v-toolbar
            v-toolbar-title เว็บ
            v-toolbar-items
                v-btn(text to="/users") ผู้ใช้
                v-btn(text to="/registerenroll") สมัครสมาชิก
                v-btn(text to="/login") ล็อกอิน

        
        v-app
            v-container(fluid)
                router-view

</template>

<script>
export default {
  name: "AdminBar",
  data: () => ({
    //
  })
};
</script>

<style scoped>

</style>
