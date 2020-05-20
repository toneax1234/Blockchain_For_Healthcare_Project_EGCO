<template lang="pug">
    

    v-row

        v-col(md="6" offset-md="2")
            div เพิ่มผู้ป่วย

            v-text-field(
                label="ชื่อ"
                v-model="profileId"
            )


            v-text-field(
                label="อายุ"
                v-model="age"
            )

            v-btn(color="success" @click="create") ยืนยันการเพิ่มผู้ป่วย

</template>

<script>
import { mapState } from "vuex";

export default {
  name: "create",
  data() {
    return {
      profileId: "",
      age: ""
    };
  },
  methods: {
    async create() {
      const vm = this;

      await vm.$store.dispatch("create", {
        profileId: vm.profileId,
        age: vm.age
      });

      await vm.$store.dispatch("fetchpatient");

      vm.$router.push({ path: "/" });
    }
  }
};
</script>