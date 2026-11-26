import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@/assets/tailwind-base.css'
import '@/assets/less/main.less'

const app = createApp(App)

app.use(router)

app.mount('#app')
