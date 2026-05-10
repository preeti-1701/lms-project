import { useEffect } from 'react'
import { api } from '../api/client'

export default function useProtection({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return

    let warningCount = 0
    const MAX_WARNINGS = 1
    let mounted = false
    let lastCmdShiftTime = 0
    let blurTime = 0
    setTimeout(() => { mounted = true }, 1500)

    const showNotice = (msg, severity = 'warn') => {
      const n = document.createElement('div')
      n.className = severity === 'critical' ? 'protection-notice critical' : 'protection-notice'
      n.textContent = msg
      document.body.appendChild(n)
      setTimeout(() => n.remove(), 3500)
    }

    const showFullScreenLockdown = (msg) => {
      const overlay = document.createElement('div')
      overlay.className = 'security-lockdown'
      overlay.innerHTML = `
        <div class="lockdown-inner">
          <div class="lockdown-icon">🔒</div>
          <h1>Security violation detected</h1>
          <p>${msg}</p>
          <p class="lockdown-sub">For your security, you will now be signed out.</p>
        </div>
      `
      document.body.appendChild(overlay)
    }

    const triggerForceLogout = (reason) => {
      showFullScreenLockdown(reason)
      setTimeout(async () => {
        try { await api.logout() } catch {}
        try { localStorage.clear() } catch {}
        window.location.href = '/login'
      }, 2200)
    }

    const handleSecurityEvent = (eventLabel) => {
      warningCount++
      console.log('[Protection]', eventLabel, 'warningCount:', warningCount)
      if (warningCount >= MAX_WARNINGS) {
        triggerForceLogout(`${eventLabel} detected on protected content. This activity has been logged.`)
      } else {
        showNotice(`⚠️ ${eventLabel} detected. Further attempts will sign you out.`, 'critical')
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
      showNotice('Right-click is disabled on protected content.')
    }

    const handleKeyDown = (e) => {
      // Track ANY time Cmd+Shift is being held (precursor to screenshot)
      if (e.metaKey && e.shiftKey) {
        lastCmdShiftTime = Date.now()
      }

      // Dev tools blocking
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's')) ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault()
        showNotice('Developer tools are disabled.')
        return
      }

      // Direct screenshot key match (when browser DOES see the digit)
      if (e.metaKey && e.shiftKey) {
        const key = e.key
        const code = e.code
        if (
          key === '3' || key === '4' || key === '5' || key === '6' ||
          key === '#' || key === '$' || key === '%' || key === '^' ||
          code === 'Digit3' || code === 'Digit4' || code === 'Digit5' || code === 'Digit6'
        ) {
          e.preventDefault()
          try { navigator.clipboard.writeText('') } catch {}
          handleSecurityEvent('Screenshot attempt')
          return
        }
      }

      // Windows screenshot
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault()
        try { navigator.clipboard.writeText('') } catch {}
        handleSecurityEvent('Screenshot attempt')
      }

      // Copy/save blocking
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'a' || e.key === 'p')) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          showNotice('Copying is disabled on protected content.')
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText('') } catch {}
        handleSecurityEvent('Screenshot attempt')
      }
    }

    // BLUR DETECTION — Mac screenshot tool takes focus
    const handleBlur = () => {
      if (!mounted) return
      blurTime = Date.now()
      document.body.classList.add('content-hidden')

      // If Cmd+Shift was pressed within the last 2 seconds, this blur is the screenshot tool
      const timeSinceCmdShift = Date.now() - lastCmdShiftTime
      console.log('[Protection] blur — time since Cmd+Shift:', timeSinceCmdShift, 'ms')
      if (lastCmdShiftTime > 0 && timeSinceCmdShift < 2000) {
        handleSecurityEvent('Screenshot tool detected')
      }
    }
    const handleFocus = () => {
      if (!mounted) return
      document.body.classList.remove('content-hidden')
    }
    const handleVisibility = () => {
      if (!mounted) return
      if (document.hidden) document.body.classList.add('content-hidden')
      else document.body.classList.remove('content-hidden')
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
      document.body.classList.remove('content-hidden')
    }
  }, [enabled])
}
