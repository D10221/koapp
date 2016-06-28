export function delay(milisecond): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, milisecond));
}

export function isString(x): x is string {
    return 'string' == typeof (x);
}

export function isEmpty(x) {
    if (isString(x)) {
        return x.replace(/\s+/, '') == ''
    };
    return x != 0 && x != null && 'undefined' != typeof x;
}