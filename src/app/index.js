import { EventEmitter } from 'events';
// import models from './models';

class App extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    // this.models = models(config);
  }
}

export default App;
