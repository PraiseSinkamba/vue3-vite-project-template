import { useRouteParams, useRouteQuery } from '@vueuse/router'
import type { MaybeRefOrGetter, MaybeRef,Ref } from 'vue'
import type { RouteParamValueRaw } from 'vue-router';
import { useRoute, useRouter } from 'vue-router'

/*
  Copied from vueuse for the router to work
  otherwise useless to us
*/
type RouteQueryValueRaw = RouteParamValueRaw | string[];
interface ReactiveRouteOptions {
  mode?: MaybeRef<'replace' | 'push'>;
  route?: ReturnType<typeof useRoute>;
  router?: ReturnType<typeof useRouter>;
}
interface ReactiveRouteOptionsWithTransform<V, R> extends ReactiveRouteOptions {
  transform?: ((val: V) => R) | ({
    get?: (value: V) => R;
    set?: (value: R) => V;
  });
}

export function useCurrentRoute() {
  const currentRoute = useRoute()
  function query<T extends RouteQueryValueRaw = RouteQueryValueRaw, K = T>(
    name: string,
    defaultValue?: MaybeRefOrGetter<T>,
    options?: ReactiveRouteOptionsWithTransform<T, K>
  ): Ref<K> {
    return useRouteQuery(name,defaultValue, options)
  }
  function param<T extends RouteParamValueRaw = RouteParamValueRaw, K = T>(
    name: string,
    defaultValue?: MaybeRefOrGetter<T>,
    options?: ReactiveRouteOptionsWithTransform<T, K>
  ): Ref<K>{
    return useRouteParams(name, defaultValue, options)
  }
  return {
    currentRoute,
    query,
    param
  }
}
