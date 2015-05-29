import config from './config';
import events from 'events';

class App extends events.EventEmitter {
  constructor() {
    super();
  }
}

// controllers
import listener from './controllers/listeners';
import register from './controllers/register';

let app = window.app = new App();

// config
config(app);

// ctrls
listener(app);
register(app);

$(document).ready(() => {
  app.emit('appStarted');
});
