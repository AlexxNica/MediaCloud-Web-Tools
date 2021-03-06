import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const FETCH_TOPIC_MAP_FILES = 'FETCH_TOPIC_MAP_FILES';

// pass in topic id & params (snapshot id, focus id, timespan id)
export const fetchTopicMapFiles = createAsyncAction(FETCH_TOPIC_MAP_FILES, api.topicMapFiles);
