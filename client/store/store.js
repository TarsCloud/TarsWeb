import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        name: "",
        marketUid: ""
    },
    mutations: {
        increment(state, name) {
            state.name = name
        },
        marketUid(state, uid) {
            console.log('marketUid');
            state.marketUid = uid
        }
    }
})

export default store