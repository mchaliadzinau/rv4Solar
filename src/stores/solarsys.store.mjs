import createStore from '/@/unistore/unistore.mjs';
import devtools    from '/@/unistore/devtools.mjs';

let initialState = { count: 1100 };

let store = !DEV ?  createStore(initialState) : devtools(createStore(initialState));

export const actions = store => ({
    // Actions can just return a state update:
    increment(state) {
        return { count: state.count+1 }
    },

    // The above example as an Arrow Function:
    increment2: ({ count }) => ({ count: count+1 }),

    //Actions receive current state as first parameter and any other params next
    //check this function as <button onClick={incrementAndLog}>
    incrementAndLog: ({ count }, event) => {
        console.info(event)
        return { count: count+1 }
    },

    // Async actions can be pure async/promise functions:
    async getStuff(state) {
        let res = await fetch('/foo.json')
        return { stuff: await res.json() }
    },

    // ... or just actions that call store.setState() later:
    incrementAsync(state) {
        setTimeout( () => {
        store.setState({ count: state.count+1 })
        }, 100)
    }
});

export default store;