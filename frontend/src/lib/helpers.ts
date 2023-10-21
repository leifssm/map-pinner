export const fetcher = (resource: RequestInfo | URL, init?: RequestInit) => fetch(resource, init).then(res => res.json());
