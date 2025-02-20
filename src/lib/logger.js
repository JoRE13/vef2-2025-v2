export class Logger {
    constructor(silent = false) {
      this.silent = silent;
    }
  
    info(...messages) {
      if (this.silent) {
        return;
      }
      console.info(...messages);
    }
  
    error(...messages) {
      if (this.silent) {
        return;
      }
      console.error(...messages);
    }
  }
  
  export const logger = new Logger();