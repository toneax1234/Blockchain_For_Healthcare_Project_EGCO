<template lang="pug">
  
    v-row
        v-col(md="8" offset-md="2")

            v-data-table(
                :headers="headers"
                :items="raw_user"
            )

                template(v-slot:item.usertype="{item}")
                    span {{ item.usertype }} 

                template(v-slot:item.enrollStatus="{item}")
                    span {{ item.enrollStatus }} 

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
        { text: "ID", value: "id" },
        { text: "ชื่อ", value: "usertype" },
        { text: "enroll", value: "enrollStatus" }
      ]
    };
  },
  computed: {
    ...mapState({
      raw_user: state => state.raw_user
    })
  },
  methods: {
   
  },
  mounted() {
    this.$store.dispatch("fetchAllUsers");
  
  }
};
</script>

<style scoped>
.noline{
  text-decoration: none;
}
</style>
