// src/utils/dateGenerator.js

export const generateSessionDates = (startDate, weekDay, totalSessions = 15) => {
    const sessions = [];
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
    }

    if (weekDay < 0 || weekDay > 6) {
        throw new Error('Week day must be between 0 (Sunday) and 6 (Saturday)');
    }

    let current = new Date(start);
    while (current.getDay() !== weekDay) {
        current.setDate(current.getDate() + 1);
    }

    for (let i = 0; i < totalSessions; i++) {
        sessions.push({
            number: i + 1,
            date: formatDate(current),
            status: 'scheduled',
            note: ''
        });
        current.setDate(current.getDate() + 7);
    }

    return sessions;
};

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDayName = (weekDay) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[weekDay] || 'Unknown';
};

export const parseDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
};