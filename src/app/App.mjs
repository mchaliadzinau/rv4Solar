import { Component } from '/@/preact.mjs';
import { _, div, ul, li, h1, h2 } from '/utils/pelems.mjs';

export default class App extends Component {
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
	}
	render(props, state) {
		return (
			div({id:'app'}, state.message)
		);
	}
}