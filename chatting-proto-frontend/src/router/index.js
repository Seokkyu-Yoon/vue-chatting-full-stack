import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Rooms from '@/views/Rooms.vue'
import Chat from '@/views/Chat.vue'
import Access from '@/views/Access.vue'
import ChatRouter from '@/views/ChatRouter.vue'

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
  },
  {
    path: '/chat/:userId/:userPw/:roomId',
    name: 'ChatRouterNoRoomPw',
    component: ChatRouter
  },
  {
    path: '/chat/:userId/:userPw/:roomId/:roomPw',
    name: 'ChatRouter',
    component: ChatRouter
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
