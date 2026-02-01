
// Convert 12h time string (e.g. "1:30 PM") to 24h format (e.g. "13:30") for input value
export const convert12to24 = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
};

// Convert 24h time string (e.g. "13:30") to 12h format (e.g. "1:30 PM") for storage/display
export const convert24to12 = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    let h = parseInt(hours, 10);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${m} ${ampm}`;
};
