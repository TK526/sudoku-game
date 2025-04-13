// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification' // Import Toast and options type

// Import the CSS
import 'vue-toastification/dist/index.css';

import './style.css'

const app = createApp(App);

// Configure Toast options
const toastOptions: PluginOptions = {
    position: POSITION.TOP_RIGHT, // Where toasts appear
    timeout: 4000, // Default duration in ms (4 seconds)
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button", // Use a button element for the close button
    icon: true, // Show default icons
    rtl: false
};

// Register the plugin
app.use(Toast, toastOptions);

app.mount('#app');