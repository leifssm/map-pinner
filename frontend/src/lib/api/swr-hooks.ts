import useSWR, { type Key } from "swr";
import useSWRMutation from "swr/mutation"

export const resolveUrl = (...path: string[]) => {
  return `${import.meta.env.VITE_SERVER_URL}/api/v1/${path.join("/")}`.replace(/\/+/g, "/");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useMutation = <ReturnType = any, Args extends object | undefined = undefined, Error = any>(url: string) => {
  return useSWRMutation<ReturnType, Error, Key, Args>(url, async (_: unknown, options: { arg: Args } ) => {
    let request: Request;
    try {
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
    return json.body as ReturnType;
  });
}

export type FetcherArgs<P extends object | undefined> = {
  skip?: boolean;
  params?: {
    [K in keyof P]: P[K];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFetcher = <ReturnType = any, Args extends object | undefined = undefined, Error = any>(url: string, arg?: FetcherArgs<Args>) => {
  const key = arg?.skip ? null : url;
  return useSWR<ReturnType, Error>(key, async () => {
    const urlString = new URL(resolveUrl(url));
    console.log("urlString:", urlString);
    
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
