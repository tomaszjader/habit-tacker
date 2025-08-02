// Modern dialog utilities that match the app's glass morphism design

export const showModernAlert = (message: string, type: 'success' | 'error' | 'info' = 'info'): Promise<void> => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fade-in 0.3s ease-out;
      padding: 20px;
    `;

    const getIconAndColor = () => {
      switch (type) {
        case 'success':
          return { icon: '✅', color: '#10b981' };
        case 'error':
          return { icon: '❌', color: '#ef4444' };
        default:
          return { icon: 'ℹ️', color: '#3b82f6' };
      }
    };

    const { icon, color } = getIconAndColor();

    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 0 10px ${color}80);">${icon}</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 24px; line-height: 1.4; color: white;">${message}</div>
        <button id="modern-alert-ok" style="
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          padding: 12px 32px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px ${color}40;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        ">OK</button>
      </div>
    `;
    dialog.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 400px;
      width: 100%;
      animation: slide-up 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const okButton = dialog.querySelector('#modern-alert-ok') as HTMLButtonElement;
    okButton.addEventListener('mouseenter', () => {
      okButton.style.transform = 'translateY(-2px) scale(1.05)';
      okButton.style.boxShadow = `0 8px 30px ${color}60`;
    });
    okButton.addEventListener('mouseleave', () => {
      okButton.style.transform = 'translateY(0) scale(1)';
      okButton.style.boxShadow = `0 4px 20px ${color}40`;
    });

    const closeDialog = () => {
      overlay.style.animation = 'fade-out 0.3s ease-out';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        resolve();
      }, 300);
    };

    okButton.addEventListener('click', closeDialog);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // Add keyboard support
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeydown);
        closeDialog();
      }
    };
    document.addEventListener('keydown', handleKeydown);
  });
};

export const showModernConfirm = (message: string, confirmText: string = 'Tak', cancelText: string = 'Anuluj'): Promise<boolean> => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fade-in 0.3s ease-out;
      padding: 20px;
    `;

    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));">⚠️</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 32px; line-height: 1.4; color: white;">${message}</div>
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button id="modern-confirm-cancel" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          ">${cancelText}</button>
          <button id="modern-confirm-ok" style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          ">${confirmText}</button>
        </div>
      </div>
    `;
    dialog.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 400px;
      width: 100%;
      animation: slide-up 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const okButton = dialog.querySelector('#modern-confirm-ok') as HTMLButtonElement;
    const cancelButton = dialog.querySelector('#modern-confirm-cancel') as HTMLButtonElement;

    // Add hover effects
    okButton.addEventListener('mouseenter', () => {
      okButton.style.transform = 'translateY(-2px) scale(1.05)';
      okButton.style.boxShadow = '0 8px 30px rgba(239, 68, 68, 0.6)';
    });
    okButton.addEventListener('mouseleave', () => {
      okButton.style.transform = 'translateY(0) scale(1)';
      okButton.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.4)';
    });

    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
      cancelButton.style.transform = 'translateY(-2px) scale(1.05)';
    });
    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.background = 'rgba(255, 255, 255, 0.1)';
      cancelButton.style.transform = 'translateY(0) scale(1)';
    });

    const closeDialog = (result: boolean) => {
      overlay.style.animation = 'fade-out 0.3s ease-out';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        resolve(result);
      }, 300);
    };

    okButton.addEventListener('click', () => closeDialog(true));
    cancelButton.addEventListener('click', () => closeDialog(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog(false);
      }
    });

    // Add keyboard support
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        document.removeEventListener('keydown', handleKeydown);
        closeDialog(true);
      } else if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeydown);
        closeDialog(false);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  });
};