import MOCK_DATA from './mockData.mjs'
const MS_12_HOURS = 43200000;
const MS_24_HOURS = 86400000;

export const bodyIds = {
    SUN: 10,
    MERCURY: 199,
    VENUS: 299,
    "EARTH": 399,
    "EMB": 3,
    "MARS": 499,
    "JUPITER": 599,
    "SATURN": 699,
    "URANUS": 799,
    "NEPTUNE": 899,
    "PLUTO": 999
};

const bodies = {
    interval: { start: null, end: null },
    [bodyIds.SUN]: {
        label: 'Sun',
        color: 'red',
        radius: 696000,
        photosphereRadius: 696500
    },
    [bodyIds.MERCURY]: {
        label: 'Mercury',
        color: 'gray',
        radius: 2440
    },
    [bodyIds.VENUS]: {
        label: 'Venus',
        color: 'yellow',
        radius: 6051
    }
}; 

export function getCurrentPositions() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hoursStart = now.getUTCHours() - 2 > 0 ? 12 : '00';
    
    const time1 = new Date(`${year}-${month}-${day} ${hoursStart}:00:00`).getTime();
    const time2 = new Date(time1 + MS_12_HOURS).getTime();
    const time3 = new Date(time1 + MS_24_HOURS).getTime();
    
    return {
        interval: {start: time1, mid: time2, end: time3},
        positions: MOCK_DATA.map(entry=>{
            const entity = Object.assign({},{
                id: entry.id, 
                coordinates: [
                    Object.assign({},entry[time1], {time: time1}), 
                    Object.assign({},entry[time2], {time: time2}),
                    Object.assign({},entry[time3], {time: time3})
                ],
            }, bodies[entry.id]);
            return entity;
        })
    };
}

