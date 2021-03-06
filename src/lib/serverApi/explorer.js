import { createApiPromise, acceptParams, generateParamStr } from '../apiUtil';

export function fetchSampleSearches() {
  return createApiPromise('/api/explorer/sample-searches');
}

export function fetchSavedSearches() {
  return createApiPromise('/api/explorer/saved-searches');
}

// top words is not like the other widgets. Will either have a search id, or will have comparedQueries
export function fetchDemoQueryTopWords(queryA, queryB) {
  let acceptedParamsA = null;
  let acceptedParamsB = null;
  const acceptedParams = [];

  const testParams = acceptParams(queryA, ['search_id']);
  if (testParams.search_id !== undefined) { // by demo search id
    acceptedParamsA = acceptParams(queryA, ['index', 'search_id', 'query_id', 'q']);
    acceptedParamsB = acceptParams(queryB, ['index', 'search_id', 'query_id', 'q']);
  } else {  // by demo keyword
    acceptedParamsA = acceptParams(queryA, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
    acceptedParamsB = acceptParams(queryB, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  }
  acceptedParams['compared_queries[]'] = [generateParamStr(acceptedParamsA)];
  if (queryB) {
    acceptedParams['compared_queries[]'] = acceptedParams['compared_queries[]'].concat(generateParamStr(acceptedParamsB));
  }
  return createApiPromise('/api/explorer/demo/words/count', acceptedParams);
}

export function fetchQueryTopWords(queryA, queryB) {
  const acceptedParams = [];
  const acceptedParamsA = acceptParams(queryA, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  const acceptedParamsB = acceptParams(queryB, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  acceptedParams['compared_queries[]'] = [generateParamStr(acceptedParamsA)];
  if (queryB) {
    acceptedParams['compared_queries[]'] = acceptedParams['compared_queries[]'].concat(generateParamStr(acceptedParamsB));
  }
  return createApiPromise('/api/explorer/words/count', acceptedParams);
}

// the following 12 functions depend on having a corresponding index to properly route the results to the right query
export function fetchDemoQuerySentenceCounts(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/sentences/count', acceptedParams);
}

export function fetchDemoQuerySampleStories(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/stories/sample', acceptedParams);
}

export function fetchDemoQueryStoryCount(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('/api/explorer/demo/story/count', acceptedParams);
}

export function fetchDemoQueryGeo(params) {
  const acceptedParams = acceptParams(params, ['index', 'search_id', 'query_id', 'q']);
  return createApiPromise('api/explorer/demo/geo-tags/counts', acceptedParams);
}

export function demoQuerySourcesByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'sources']);
  acceptedParams['sources[]'] = params.sources;
  return createApiPromise('api/explorer/demo/sources/list', acceptedParams);
}

export function demoQueryCollectionsByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'collections']);
  acceptedParams['collections[]'] = params.collections;
  return createApiPromise('api/explorer/demo/collections/list', acceptedParams);
}

export function fetchQuerySentenceCounts(params) {
  const acceptedParams = acceptParams(params, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  return createApiPromise('/api/explorer/sentences/count', acceptedParams);
}

export function fetchQuerySampleStories(params) {
  const acceptedParams = acceptParams(params, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  return createApiPromise('/api/explorer/stories/sample', acceptedParams);
}

export function fetchQueryStoryCount(params) {
  const acceptedParams = acceptParams(params, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  return createApiPromise('/api/explorer/story/count', acceptedParams);
}

export function fetchQueryGeo(params) {
  const acceptedParams = acceptParams(params, ['index', 'q', 'start_date', 'end_date', 'sources', 'collections']);
  return createApiPromise('api/explorer/geo-tags/counts', acceptedParams);
}

export function fetchQuerySourcesByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'sources']);
  acceptedParams['sources[]'] = params.sources;
  return createApiPromise('api/explorer/sources/list', acceptedParams);
}

export function fetchQueryCollectionsByIds(params) {
  const acceptedParams = acceptParams(params, ['index', 'collections']);
  acceptedParams['collections[]'] = params.collections;
  return createApiPromise('api/explorer/collections/list', acceptedParams);
}

export function loadUserSearches() {
  return createApiPromise('api/explorer/loadUserSearches');
}

export function saveUserSearch(params) {
  const acceptedParams = acceptParams(params, ['label', 'query_string']);
  return createApiPromise('api/explorer/saveQuery', acceptedParams);
}

export const TEMP = 'TEMP'; // placeholder to remove stupid lint error
