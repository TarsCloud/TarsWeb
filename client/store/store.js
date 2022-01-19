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
        quit(state) {
            state.marketUid = '';
            window.localStorage.uid = "";
            window.localStorage.ticket = "";
        },
        marketUid(state, uid) {
            state.marketUid = uid
        }
    }
})

export default store