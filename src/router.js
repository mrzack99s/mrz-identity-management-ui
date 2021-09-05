import Vue from 'vue'
import Router from 'vue-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Users from './pages/Users'
import Groups from './pages/Groups'
import BWGroups from './pages/BWGroups'
import MultiUsers from './pages/Multiusers'
import OnlineUsers from './pages/Onlineusers'
import GroupAdd from './pages/GroupAdd'
import BWGroupAdd from './pages/BWGroupAdd'
import UserAdd from './pages/UserAdd'
import Login from './components/Login'
Vue.use(Router)
//
export default new Router({
    mode: 'history',
    linkExactActiveClass: 'active',
    routes: [
        {
            path: "/",
            redirect: "/dashboard"
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/dashboard',
            component: Layout,
            redirect: '/dashboard/overview',
            children: [
                {
                    path: 'overview',
                    component: Home
                },
                {
                    path: 'online-list',
                    component: OnlineUsers
                },
            ]
        },
        {
            path: '/groups',
            component: Layout,
            redirect: '/groups/list',
            children: [
                {
                    path: 'list',
                    component: Groups
                },
                {
                    path: 'add',
                    component: GroupAdd
                },
            ]
        },
        {
            path: '/bw-groups',
            component: Layout,
            redirect: '/bw-groups/list',
            children: [
                {
                    path: 'list',
                    component: BWGroups
                },
                {
                    path: 'add',
                    component: BWGroupAdd
                },
            ]
        },
        {
            path: '/users',
            component: Layout,
            redirect: '/users/list',
            children: [
                {
                    path: 'list',
                    component: Users
                },
                {
                    path: 'add',
                    component: UserAdd
                },
            ]
        },
        {
            path: '/multiusers',
            component: Layout,
            redirect: '/multiusers/excel',
            children: [
                {
                    path: 'excel',
                    component: MultiUsers
                },
            ]
        },
    ]
})