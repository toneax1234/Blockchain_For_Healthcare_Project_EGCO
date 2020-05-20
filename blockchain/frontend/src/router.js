import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
        },
        {
            path: '/create',
            name: 'create',
            component: () => import(/* webpackChunkName: "create" */ './views/Create.vue')
        },
        {
            path: '/update/:id',
            name: 'update',
            component: () => import(/* webpackChunkName: "update" */ './views/Update.vue')
        },
        {
            path: '/users',
            name: 'users',
            component: () => import(/* webpackChunkName: "users" */ './views/Users.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import(/* webpackChunkName: "users" */ './views/Register.vue')
        },
        {
            path: '/enroll',
            name: 'enroll',
            component: () => import(/* webpackChunkName: "users" */ './views/Enroll.vue')
        },
        {
            path: '/regisenroll',
            name: 'regisenroll',
            component: () => import(/* webpackChunkName: "users" */ './views/RegisEnroll.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import(/* webpackChunkName: "users" */ './views/Login.vue')
        }
    ]
})
