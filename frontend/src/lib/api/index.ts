import { useFetcher, useMutation, FetcherArgs } from "./swr-hooks";
import { AddLocationBody, AddLocationReturn } from "@backend/routes/location/structs.ts";
import { GetLocationsReturn } from "@backend/routes/location/structs.ts";
import { LogInBody, LogInReturn } from "@backend/routes/users/structs.ts";
import { SignInBody, SignInReturn } from "@backend/routes/users/structs.ts";

export const useAddLocationMutation = () => useMutation<AddLocationReturn, AddLocationBody>("/location/add");

export const useGetLocationsFetcher = () => useFetcher<GetLocationsReturn, undefined>("/location");

export const useHealthFetcher = () => useFetcher<'ok'>("/health");

export const useLogInMutation = () => useMutation<LogInReturn, LogInBody>("/users/login");

export const useSignInFetcher = (args?: FetcherArgs<SignInBody>) => useFetcher<SignInReturn, SignInBody>("/users/signin", args);
