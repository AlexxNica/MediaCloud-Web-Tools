import { resolve, reject } from 'redux-simple-promise';
import { FETCH_TOPIC_TOP_WORDS } from '../../../../actions/topicActions';
import * as fetchConstants from '../../../../lib/fetchConstants.js';

const INITIAL_STATE = {
  fetchStatus: fetchConstants.FETCH_INVALID,
  list: [],
};

function topWords(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_TOPIC_TOP_WORDS:
      return Object.assign({}, state, {
        ...state,
        fetchStatus: fetchConstants.FETCH_ONGOING,
      });
    case resolve(FETCH_TOPIC_TOP_WORDS):
      return Object.assign({}, state, {
        ...state,
        fetchStatus: fetchConstants.FETCH_SUCCEEDED,
        list: action.payload.results,
      });
    case reject(FETCH_TOPIC_TOP_WORDS):
      return Object.assign({}, state, {
        ...state,
        fetchStatus: fetchConstants.FETCH_FAILED,
      });
    default:
      return state;
  }
}

export default topWords;