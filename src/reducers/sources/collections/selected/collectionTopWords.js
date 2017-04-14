import { FETCH_COLLECTION_TOP_WORDS } from '../../../../actions/sourceActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';
import { PAST_ALL } from '../../../../lib/dateUtil';

const collectionTopWords = createAsyncReducer({
  initialState: {
    list: [],
    total: null,
    timePeriod: PAST_ALL,
  },
  action: FETCH_COLLECTION_TOP_WORDS,
  handleFetch: payload => ({
    timePeriod: payload.args[1].timePeriod,
  }),
  handleSuccess: payload => ({
    total: payload.total,
    list: payload.results,
  }),
});

export default collectionTopWords;

