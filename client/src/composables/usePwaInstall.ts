import { ref, onMounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = ref(false)
const isStandalone = ref(false)
const isIos = ref(false)
const showIosGuide = ref(false)

export function usePwaInstall() {
  function checkEnvironment() {
    if (typeof window === 'undefined') return

    // 1. Detect Standalone / PWA Mode
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = (navigator as any).standalone === true
    isStandalone.value = isStandaloneDisplay || isIosStandalone

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(ua)
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua)
    isIos.value = isIphoneOrIpad && isSafari && !isStandalone.value

    // If already installed, we do not need install prompt
    if (isStandalone.value) {
      canInstall.value = false
    }
  }

  async function installApp() {
    if (isIos.value) {
      showIosGuide.value = true
      return
    }

    if (!deferredPrompt.value) {
      return
    }

    try {
      await deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the installation!')
        canInstall.value = false
        deferredPrompt.value = null
      }
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err)
    }
  }

  function dismissInstall() {
    canInstall.value = false
    try {
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
    } catch (e) {}
  }

  onMounted(() => {
    checkEnvironment()

    // Listen for Chrome/Edge/Android beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e as BeforeInstallPromptEvent
      
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!lastDismissed || Date.now() - Number(lastDismissed) > 86400000) {
        canInstall.value = true
      }
    })

    // Listen for successful install event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App successfully installed!')
      canInstall.value = false
      deferredPrompt.value = null
      isStandalone.value = true
    })
  })

  return {
    canInstall,
    isStandalone,
    isIos,
    showIosGuide,
    installApp,
    dismissInstall
  }
}
