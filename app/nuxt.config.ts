// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  
  css: ['~/assets/css/main.css'],
  
  ui: {
    global: true,
  },
  
  typescript: {
    strict: true,
  },
  
  app: {
    head: {
      title: 'Backup Data Integrity Dashboard',
      meta: [
        { name: 'description', content: 'Monitor and manage backup data chunks' }
      ]
    }
  }
})
