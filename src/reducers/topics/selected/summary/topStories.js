import { FETCH_TOPIC_TOP_STORIES, SORT_TOPIC_TOP_STORIES } from '../../../../actions/topicActions';
import { createAsyncReducer } from '../../../../lib/reduxHelpers';

const topStories = createAsyncReducer({
  initialState: {
    sort: 'inlink',
    stories: [],
  },
  action: FETCH_TOPIC_TOP_STORIES,
  [SORT_TOPIC_TOP_STORIES]: payload => ({ sort: payload }),
});

export default topStories;
