import MOCK_DATA from './mockData.mjs'
const MS_12_HOURS = 43200000;
const MS_24_HOURS = 86400000;
const ORBIT_POINTS = 8;

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
        radius: 2440,
        orbitDays: 88
    },
    [bodyIds.VENUS]: {
        label: 'Venus',
        color: 'yellow',
        radius: 6051,
        orbitDays: 225,
        rotationPeriod: 243
    },
    [bodyIds.EARTH]: {
        label: 'Earth',
        color: 'green',
        radius: 6371,
        orbitDays: 365,
        rotationPeriod: 1 // 23 hours, 56 minutes
    },
    [bodyIds.MARS]: {
        label: 'Mars',
        color: 'red',
        radius: 3389.5,
        orbitDays: 687,
        rotationPeriod: 1 // 24 hours, 39 minutes, and 35.244 seconds.
    }
}; 

export function getCurrentPositions(ms) {
    const now = ms ? new Date(ms) : new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hoursStart = now.getHours() > 0 ? 12 : '00'; // TO DO getUTCHours when UTC is used
    
    const time1 = new Date(`${year}-${month}-${day} ${hoursStart}:00:00`).getTime();
    const time2 = new Date(time1 + MS_12_HOURS).getTime();
    const time3 = new Date(time1 + MS_24_HOURS).getTime();
    
    return {
        interval: {start: time1, mid: time2, end: time3},
        positions: MOCK_DATA.map(entry=>{
            if(bodies[entry.id]) {
                const orbitSplitTime = bodies[entry.id].orbitDays ? Math.ceil(bodies[entry.id].orbitDays / ORBIT_POINTS) * MS_24_HOURS : 0;
    
                const entity = Object.assign({},{
                    id: entry.id, 
                    coordinates: [
                        Object.assign({},entry[time1], {time: time1}), 
                        Object.assign({},entry[time2], {time: time2}),
                        Object.assign({},entry[time3], {time: time3})
                    ],
                    orbit: orbitSplitTime > 0 ? [
                        entry[time1] ? Object.assign({},entry[time1]) : null,
                        entry[time1 +  orbitSplitTime] ? Object.assign({},entry[time1 +  orbitSplitTime]) : null,
                        entry[time1 +  2 * orbitSplitTime] ? Object.assign({},entry[time1 +  2 * orbitSplitTime]) : null,
                        entry[time1 +  3 * orbitSplitTime] ? Object.assign({},entry[time1 +  3 * orbitSplitTime]) : null,
                        entry[time1 +  4 * orbitSplitTime] ? Object.assign({},entry[time1 +  4 * orbitSplitTime]) : null,
                        entry[time1 +  5 * orbitSplitTime] ? Object.assign({},entry[time1 +  5 * orbitSplitTime]) : null,
                        entry[time1 +  6 * orbitSplitTime] ? Object.assign({},entry[time1 +  6 * orbitSplitTime]) : null,
                        entry[time1 +  7 * orbitSplitTime] ? Object.assign({},entry[time1 +  7 * orbitSplitTime]) : null,
                        entry[time1 +  8 * orbitSplitTime] ? Object.assign({},entry[time1 +  8 * orbitSplitTime]) : null,
                    ] : []
                }, bodies[entry.id]);
                return entity;
            } else {
                return {}
            }
        })
    };
}

