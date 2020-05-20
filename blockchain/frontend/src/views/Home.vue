<template lang="pug">
  
    v-row
        v-col(md="8" offset-md="2")
            div รายชื่อผู้ป่วย

            v-data-table(
                :headers="headers"
                :items="raw_patient"
            )

                template(v-slot:item.age="{item}")
                    span {{ item.age }} 

                template(v-slot:item.idl="{ item }") 
                      router-link.noline(:to="'/update/' + item.profileId") แก้ไขข้อมูล 
                        
                      a(@click="destroy(item.profileId)") ลบ
                    

</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      headers: [
       
        { text: "ชื่อ", value: "profileId" },
        { text: "อายุ", value: "age" },
        { text: "", value: "idl" }
      ]
    };
  },
  computed: {
    ...mapState({
      raw_patient: state => state.raw_patient
    })
  },
  methods: {
    async destroy(id) {
      const vm = this;

      await vm.$store.dispatch("delete", id);
      await vm.$store.dispatch("fetchpatient");
    }
  },
  mounted() {
    this.$store.dispatch("fetchpatient");
  }
};
</script>

<style scoped>
.noline{
  text-decoration: none;
}
</style>
