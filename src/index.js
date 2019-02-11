import { createElement, render } from '/@/preact.mjs';
import App from './app/App.mjs';
import createStore from '/@/unistore/unistore.mjs';
import devtools    from '/@/unistore/devtools.mjs';

import { Provider } from '/@/unistore/integrations/preact.mjs';

const h = createElement;

let initialState = { count: 1100 };

let store = !DEV ?  createStore(initialState) : devtools(createStore(initialState));


render( h(Provider, {store}, h(App) ), document.body);