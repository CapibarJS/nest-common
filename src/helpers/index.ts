export function createObjectFromString(str: string, value: any) {
    const parts = str.split('.');
    const obj = {};
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        current[part] = i === parts.length - 1 ? value : {};
        current = current[part];
    }
    return obj;
}
