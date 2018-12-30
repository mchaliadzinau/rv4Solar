import { Component } from '/@/preact.mjs';
import { _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

export default class App extends Component {
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
	}
	render(props, state) {
		return (
			div(null,
				div({id:'panel-bottom'},
					table({style:'float:left'},
						tr(null,
							td(null,'x'), td(null,'y'), td(null,'z'), td(null,'orientation')
						),
						tr(null,
							td({class:'cam-x'}), td({class:'cam-y'}), td({class:'cam-z'}), td({class:'cam-orientation'})
						),
					),
	
					table({style:'float:right'},
						tr(null,
							td(null,
								_('input')({class:'cam-control-speed', type:"number", placeholder:"Cam speed", pattern:"[0-9]{1,16}"})
							),
							td(null,
								'cam inertia:',
								_('input')({class:'cam-control-inertia', type:"checkbox"})
							)
						)
					)
				),
				div({id:'canvas-wrapper'})
			)
		)
	}
}