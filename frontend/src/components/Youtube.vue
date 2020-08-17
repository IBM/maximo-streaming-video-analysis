import Youtube from 'youtube-stream-url';
export default {
  install: function(Vue,) {
    Object.defineProperty(Vue.prototype, '$Youtube', { value: Youtube });
  }
}
