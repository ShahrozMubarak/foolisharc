import { useEffect } from 'react';
export function useModelViewer() {
  useEffect(() => {
    if (
      customElements.get('model-viewer') ||
      document.querySelector('script[data-model-viewer]')
    )
      return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/libs/model-viewer.min.js';
    script.dataset.modelViewer = 'true';
    script.onerror = () => script.remove();
    document.head.append(script);
  }, []);
}
