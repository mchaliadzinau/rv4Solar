import { Component } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

const N_A = 'n/a';
class CamPanel extends Component {
    constructor(props) {
		super(props);
        this.onCamSpeedChange = this.onCamSpeedChange.bind(this);
        this.onCamInertiaClick = this.onCamInertiaClick.bind(this);

    }
    
    onCamSpeedChange(event) {
        if(!isNaN(event.target.value) && event.target.value > 0 && event.target.value < 900000000000000) {
            this.props.onCamSpeedChange && this.props.onCamSpeedChange(parseFloat(event.target.value));
        }
    }

    onCamInertiaClick(e) {
        this.props.onCamInertiaClick && this.props.onCamInertiaClick(e.target.checked == true);
    }

    render(props, state) {
        const {_x, _y, _z} = props;
        const orientation = `x:${_x ? _x.toString().slice(0,10): N_A},y:${_y ? _y.toString().slice(0,10): N_A},z:${_z ?_z.toString().slice(0,10): N_A}`;
        return div({id:'panel-bottom'},
            table({style:'float:left'},
                tr(_,
                    td(_,'x'), 
                    td(_,'y'), 
                    td(_,'z'), 
                    td(_,'orientation')
                ),
                tr(_,
                    td({class:'cam-x'}, props.x || N_A), 
                    td({class:'cam-y'}, props.y || N_A), 
                    td({class:'cam-z'}, props.z || N_A), 
                    td({class:'cam-orientation'}, orientation)
                ),
            ),

            !!props.enableControls && table({style:'float:right'},
                tr(_,
                    td(_,
                        $('input')({
                            class:'cam-control-speed', type:"number", placeholder:"Cam speed", pattern:"[0-9]{1,16}", 
                            value: props.camSpeed || N_A, oninput: this.onCamSpeedChange
                        })
                    ),
                    td(_,
                        'cam inertia:',
                        $('input')({
                            class:'cam-control-inertia', type:"checkbox", 
                            value: props.camInertia, onclick: this.onCamInertiaClick
                        })
                    )
                )
            )
        )
    }
}

export default $(CamPanel);