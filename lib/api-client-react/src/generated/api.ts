import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type {
  DailyLesson,
  HealthStatus,
  ListWordsParams,
  SwipeBody,
  UpdateWordStatusBody,
  UserStats,
  UserWordStatus,
  WordDetail,
  WordWithStatus,
} from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";

type RequestOptions = Parameters<typeof customFetch>[1];

export const getHealthCheckUrl = () => `/api/healthz`;
export const healthCheck = (options?: RequestOptions) =>
  customFetch<HealthStatus>(getHealthCheckUrl(), {
    ...options,
    method: "GET",
  });

export const getHealthCheckQueryKey = () => [`/api/healthz`] as const;

export const getHealthCheckQueryOptions = <TData = HealthStatus, TError = ErrorType>(
  options?: { query?: UseQueryOptions<HealthStatus, TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    healthCheck({ ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, ...(options?.query ?? {}) } as UseQueryOptions<
    HealthStatus,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useHealthCheck = <TData = HealthStatus, TError = ErrorType>(
  options?: { query?: UseQueryOptions<HealthStatus, TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};

export const getListWordsUrl = (params?: ListWordsParams) => {
  const searchParams = new URLSearchParams();

  if (params?.search !== undefined && params.search !== "") {
    searchParams.set("search", params.search);
  }

  if (params?.status !== undefined) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();
  return query ? `/api/words?${query}` : `/api/words`;
};

export const listWords = (params?: ListWordsParams, options?: RequestOptions) =>
  customFetch<WordWithStatus[]>(getListWordsUrl(params), {
    ...options,
    method: "GET",
  });

export const getListWordsQueryKey = (params?: ListWordsParams) =>
  params ? ([`/api/words`, params] as const) : ([`/api/words`] as const);

export const getListWordsQueryOptions = <TData = WordWithStatus[], TError = ErrorType>(
  params?: ListWordsParams,
  options?: { query?: UseQueryOptions<WordWithStatus[], TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getListWordsQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    listWords(params, { ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, ...(options?.query ?? {}) } as UseQueryOptions<
    WordWithStatus[],
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useListWords = <TData = WordWithStatus[], TError = ErrorType>(
  params?: ListWordsParams,
  options?: { query?: UseQueryOptions<WordWithStatus[], TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getListWordsQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};

export const getGetWordUrl = (id: number) => `/api/words/${id}`;
export const getWord = (id: number, options?: RequestOptions) =>
  customFetch<WordDetail>(getGetWordUrl(id), {
    ...options,
    method: "GET",
  });

export const getGetWordQueryKey = (id: number) => [`/api/words/${id}`] as const;

export const getGetWordQueryOptions = <TData = WordDetail, TError = ErrorType>(
  id: number,
  options?: { query?: UseQueryOptions<WordDetail, TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getGetWordQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getWord(id, { ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, enabled: !!id, ...(options?.query ?? {}) } as UseQueryOptions<
    WordDetail,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useGetWord = <TData = WordDetail, TError = ErrorType>(
  id: number,
  options?: { query?: UseQueryOptions<WordDetail, TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetWordQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};

export const getGetSwipeQueueUrl = () => `/api/swipe`;
export const getSwipeQueue = (options?: RequestOptions) =>
  customFetch<WordWithStatus[]>(getGetSwipeQueueUrl(), {
    ...options,
    method: "GET",
  });

export const getGetSwipeQueueQueryKey = () => [`/api/swipe`] as const;

export const getGetSwipeQueueQueryOptions = <TData = WordWithStatus[], TError = ErrorType>(
  options?: { query?: UseQueryOptions<WordWithStatus[], TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getGetSwipeQueueQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getSwipeQueue({ ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, ...(options?.query ?? {}) } as UseQueryOptions<
    WordWithStatus[],
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useGetSwipeQueue = <TData = WordWithStatus[], TError = ErrorType>(
  options?: { query?: UseQueryOptions<WordWithStatus[], TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetSwipeQueueQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};

export const getRecordSwipeUrl = (wordId: number) => `/api/swipe/${wordId}`;
export const recordSwipe = (wordId: number, swipeBody: SwipeBody, options?: RequestOptions) =>
  customFetch<UserWordStatus>(getRecordSwipeUrl(wordId), {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(swipeBody),
  });

export const getRecordSwipeMutationOptions = <
  TError = ErrorType,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<UserWordStatus, TError, { wordId: number; data: SwipeBody }, TContext>;
    request?: RequestOptions;
  },
) => {
  const mutationFn: MutationFunction<UserWordStatus, { wordId: number; data: SwipeBody }> = (
    props,
  ) => recordSwipe(props.wordId, props.data, options?.request);

  return {
    mutationFn,
    ...(options?.mutation ?? {}),
  } as UseMutationOptions<UserWordStatus, TError, { wordId: number; data: SwipeBody }, TContext>;
};

export const useRecordSwipe = <TError = ErrorType, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<UserWordStatus, TError, { wordId: number; data: SwipeBody }, TContext>;
    request?: RequestOptions;
  },
): UseMutationResult<UserWordStatus, TError, { wordId: number; data: SwipeBody }, TContext> =>
  useMutation(getRecordSwipeMutationOptions(options));

export const getUpdateWordStatusUrl = (wordId: number) => `/api/user-words/${wordId}`;
export const updateWordStatus = (
  wordId: number,
  updateWordStatusBody: UpdateWordStatusBody,
  options?: RequestOptions,
) =>
  customFetch<UserWordStatus>(getUpdateWordStatusUrl(wordId), {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(updateWordStatusBody),
  });

export const getUpdateWordStatusMutationOptions = <
  TError = ErrorType,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<UserWordStatus, TError, { wordId: number; data: UpdateWordStatusBody }, TContext>;
    request?: RequestOptions;
  },
) => {
  const mutationFn: MutationFunction<
    UserWordStatus,
    { wordId: number; data: UpdateWordStatusBody }
  > = (props) => updateWordStatus(props.wordId, props.data, options?.request);

  return {
    mutationFn,
    ...(options?.mutation ?? {}),
  } as UseMutationOptions<
    UserWordStatus,
    TError,
    { wordId: number; data: UpdateWordStatusBody },
    TContext
  >;
};

export const useUpdateWordStatus = <TError = ErrorType, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<UserWordStatus, TError, { wordId: number; data: UpdateWordStatusBody }, TContext>;
    request?: RequestOptions;
  },
): UseMutationResult<
  UserWordStatus,
  TError,
  { wordId: number; data: UpdateWordStatusBody },
  TContext
> => useMutation(getUpdateWordStatusMutationOptions(options));

export const getGetDailyLessonUrl = () => `/api/daily-lesson`;
export const getDailyLesson = (options?: RequestOptions) =>
  customFetch<DailyLesson>(getGetDailyLessonUrl(), {
    ...options,
    method: "GET",
  });

export const getGetDailyLessonQueryKey = () => [`/api/daily-lesson`] as const;

export const getGetDailyLessonQueryOptions = <TData = DailyLesson, TError = ErrorType>(
  options?: { query?: UseQueryOptions<DailyLesson, TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getGetDailyLessonQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getDailyLesson({ ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, ...(options?.query ?? {}) } as UseQueryOptions<
    DailyLesson,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useGetDailyLesson = <TData = DailyLesson, TError = ErrorType>(
  options?: { query?: UseQueryOptions<DailyLesson, TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetDailyLessonQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};

export const getGetStatsUrl = () => `/api/stats`;
export const getStats = (options?: RequestOptions) =>
  customFetch<UserStats>(getGetStatsUrl(), {
    ...options,
    method: "GET",
  });

export const getGetStatsQueryKey = () => [`/api/stats`] as const;

export const getGetStatsQueryOptions = <TData = UserStats, TError = ErrorType>(
  options?: { query?: UseQueryOptions<UserStats, TError, TData>; request?: RequestOptions },
) => {
  const queryKey = options?.query?.queryKey ?? getGetStatsQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) =>
    getStats({ ...(options?.request ?? {}), signal });
  return { queryKey, queryFn, ...(options?.query ?? {}) } as UseQueryOptions<
    UserStats,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export const useGetStats = <TData = UserStats, TError = ErrorType>(
  options?: { query?: UseQueryOptions<UserStats, TError, TData>; request?: RequestOptions },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetStatsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
};