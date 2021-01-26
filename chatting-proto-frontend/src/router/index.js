import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Rooms from '@/views/Rooms.vue'
import Chat from '@/views/Chat.vue'
import Access from '@/views/Access.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/access',
    name: 'Access',
    component: Access
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
