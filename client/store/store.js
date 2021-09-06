import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        name: ""
    },
    mutations: {
        increment (state,name) {
            state.name=name
        }
    }
})

export default store