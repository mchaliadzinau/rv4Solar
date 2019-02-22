import { createElement, render } from '/@/preact.mjs';
import store from './stores/solarsys.store.mjs'
import App from './app/App.mjs';

import { Provider } from '/@/unistore/integrations/preact.mjs';

const h = createElement;

render( h(Provider, {store}, App ), document.body);