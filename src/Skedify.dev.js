import Skedify from './Skedify'
export default Skedify

const onDOMContentLoaded = () => {
  window.document.removeEventListener('DOMContentLoaded', onDOMContentLoaded)

  const livereload = document.createElement('script')

  livereload.src = `http://${
    (location.host || 'localhost').split(':')[0]
  }:35729/livereload.js?snipver=1`
  document.head.appendChild(livereload)
}

window.document.addEventListener('DOMContentLoaded', onDOMContentLoaded)
