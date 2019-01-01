import { Component } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';
import SolarInit from '/utils/solar.js';

export default class App extends Component {
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
		SolarInit();
	}
	render(props, state) {
		return (
			div(_,
				div({id:'panel-bottom'},
					table({style:'float:left'},
						tr(_,
							td(_,'x'), 
							td(_,'y'), 
							td(_,'z'), 
							td(_,'orientation')
						),
						tr(_,
							td({class:'cam-x'}), 
							td({class:'cam-y'}), 
							td({class:'cam-z'}), 
							td({class:'cam-orientation'})
						),
					),
	
					table({style:'float:right'},
						tr(_,
							td(_,
								$('input')({class:'cam-control-speed', type:"number", placeholder:"Cam speed", pattern:"[0-9]{1,16}"})
							),
							td(_,
								'cam inertia:',
								$('input')({class:'cam-control-inertia', type:"checkbox"})
							)
						)
					)
				),
				div({id:'canvas-wrapper'})
			)
		)
	}
}