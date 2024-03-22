import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from '@/router'
import 'vant/lib/index.css'
import '@/assets/iconfont/iconfont.css'

createApp(App).use(router).mount('#app')
