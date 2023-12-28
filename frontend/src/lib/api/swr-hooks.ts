import useSWR, { type Key } from "swr";
import useSWRMutation from "swr/mutation"

const resolveUrl = (...path: string[]) => {
  return `${import.meta.env.VITE_SERVER_URL}/api/v1/${path.join("/")}`.replace(/\/+/g, "/");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useMutation = <Args extends object | undefined = undefined, Data = any, Error = any>(url: string) => {
  return useSWRMutation<Data, Error, Key, Args>(url, async (_: unknown, options: { arg: Args } ) => {
    let request: Request;
    try {
      console.log(JSON.stringify(options.arg))
      const urlString = new URL(resolveUrl(url));
      request = new Request(urlString, {
        method: "POST",
        body: JSON.stringify(options.arg)
      });
      
    } catch (error) {
      console.error("reeeraaa:", error);
      throw error;
    }

    const response = await fetch(request);
    if (!response.ok) {
      const errorMessage = await response.json();
      const error = new Error(errorMessage.error || response.statusText);
      throw error;
    }
    const json = await response.json();
    return json.body as Data;
  });
}

type FetcherArgs<P extends object | undefined> = {
  skip?: boolean;
  params?: {
    [K in keyof P]: P[K];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFetch = <P extends object | undefined = undefined, Data = any, Error = any>(url: string, arg?: FetcherArgs<P>) => {
  const key = arg?.skip ? null : url;
  return useSWR<Data, Error>(key, async () => {
    const urlString = new URL(resolveUrl(url));
    if (arg?.params) for (const key in arg.params) {
      const value = arg.params[key];
      urlString.searchParams.set(key, JSON.stringify(value));
    }
    const request = new Request(urlString);

    const response = await fetch(request);
    if (!response.ok) {
      const errorMessage = await response.json();
      const error = new Error(errorMessage.error || response.statusText);
      throw error;
    }
    const json = await response.json();
    return json.body;
  });
}

export const useGetLocationsFetcher = () => {
  return useFetch<undefined, { lat: number, lon: number, timestamp: number }[]>("/location/");
}

export const useAddLocationMutation = () => {
  return useMutation<{ lat: number, lon: number, timestamp: number }, null>("/location/add");
}
