const CSS_LOAD_PATH = `/static/css`;

export default class CssLoader {
  static _styles = new Set();

  static load(file){
    const url = `${CSS_LOAD_PATH}/${file}.css`;
    if (this._styles.has(path)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject)=>{
      const link = document.createElement('link');
      link.rel = 'styleSheet';
      link.href = url;

      link.onload = () =>{
        this.loadedStyles.add();
        resolve();
      }
      link.onerror = () => reject(new Error(`CSS 로드 실패: ${href}`));

      document.head.appendChild(link);
      });
  }

}
