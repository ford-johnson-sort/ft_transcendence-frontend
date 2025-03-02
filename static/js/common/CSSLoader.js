const CSS_LOAD_PATH = `/static/css`;

export default class CSSLaoder {
  static loadedStyles = new Set();

  static load(file){
    const url = `${CSS_LOAD_PATH}/${file}.css`;
    if (this.loadedStyles.has(file)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject)=>{
      const link = document.createElement('link');
      link.rel = 'styleSheet';
      link.href = url;

      link.onload = () =>{
        this.loadedStyles.add(file);
        resolve();
      }
      link.onerror = () => reject(new Error(`CSS 로드 실패: ${href}`));

      document.head.appendChild(link);
      });
  }

}
