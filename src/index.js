import { createElement, render } from '/@/preact.mjs';
import App from './app/App.mjs';

const h = createElement;

render(h(App), document.body);