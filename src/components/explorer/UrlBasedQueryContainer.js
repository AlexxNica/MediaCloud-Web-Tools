import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { schemeCategory10 } from 'd3';
import { push } from 'react-router-redux';
import composeAsyncContainer from '../common/AsyncContainer';
import LoadingSpinner from '../common/LoadingSpinner';
import { LEVEL_ERROR } from '../common/Notice';
import { addNotice } from '../../actions/appActions';
import { selectBySearchParams, fetchSampleSearches, updateQuerySourceLookupInfo, updateQueryCollectionLookupInfo,
  fetchQuerySourcesByIds, fetchQueryCollectionsByIds, demoQuerySourcesByIds, demoQueryCollectionsByIds } from '../../actions/explorerActions';
// import { FETCH_INVALID, FETCH_SUCCEEDED } from '../../lib/fetchConstants';
import { DEFAULT_COLLECTION_OBJECT_ARRAY, autoMagicQueryLabel, generateQueryParamString } from '../../lib/explorerUtil';
import { getPastTwoWeeksDateRange } from '../../lib/dateUtil';

const localMessages = {
  errorInURLParams: { id: 'explorer.queryBuilder.urlParams',
    defaultMessage: 'Your URL query is incomplete. Check the URL and make sure the keyword(s), start and end dates, and collection(s) are properly specified.' },
};

/**
 * Only render the widget once we've pared the query from the URL - complicated because we do an async fetch
 * to get source and collection details from the server.
 */
function composeUrlBasedQueryContainer() {
  return (ChildComponent) => {
    class UrlBasedQueryContainer extends React.Component {
      state = {
        queryInStore: false,
      };
      componentWillMount() {
        this.setState({ queryInStore: false }); // necc?
        this.setQueryFromUrl(this.props.location.pathname);
      }
      componentWillReceiveProps(nextProps) {
        const { location, lastSearchTime, updateUrl, isLoggedIn } = this.props;
        // console.log('new props');
        // if URL has been updated by hand, reparse and store
        if ((nextProps.location.pathname !== location.pathname) && (lastSearchTime === nextProps.lastSearchTime)) {
          this.setState({ queryInStore: false }); // show spinner while parsing and loading query
          // console.log('  url change');
          this.setQueryFromUrl(nextProps.location.pathname);
        // if we don't have all the data in the store yet
        } else if (this.state.queryInStore === false) {   // make sure to only do this once
          // console.log('  waiting for media info from server');
          // mark the whole thing as ready once any sources and collections have been set
          if (this.isAllMediaDetailsReady()) {
            // console.log('  got media info from server, ready!');
            this.setState({ queryInStore: true });  // mark that the parsing process has finished
          }
        } else if (lastSearchTime !== nextProps.lastSearchTime) {
          updateUrl(nextProps.queries, isLoggedIn);
        } else {
          // console.log('  other change');
        }
      }
      setQueryFromUrl(url) {
        const { addAppNotice, saveQueriesFromParsedUrl, isLoggedIn, samples } = this.props;
        const { formatMessage } = this.props.intl;
        const queryAsJsonStr = url.slice(url.lastIndexOf('/') + 1, url.length);
        // here we need to handle sample ids vs. url-encoded query
        const sampleSearchId = parseInt(queryAsJsonStr, 10);
        let queriesFromUrl;
        if (!isNaN(sampleSearchId)) {
          // need to add in the id of the search here - why isn't this in there already?
          queriesFromUrl = samples[sampleSearchId].queries;
        } else {
          try {
            queriesFromUrl = JSON.parse(queryAsJsonStr);
          } catch (e) {
            addAppNotice({ level: LEVEL_ERROR, message: formatMessage(localMessages.errorInURLParams) });
            return;
          }
          let extraDefaults = {};
          // add in an index, label, and color if they are not there
          if (!isLoggedIn) {  // and demo mode needs some extra stuff too
            const defaultDates = getPastTwoWeeksDateRange();
            extraDefaults = {
              sources: [],
              collections: DEFAULT_COLLECTION_OBJECT_ARRAY,
              startDate: defaultDates.start,
              endDate: defaultDates.end,
            };
          }
          queriesFromUrl = queriesFromUrl.map((query, index) => ({
            ...query, // let anything on URL override label and color
            label: query.label ? decodeURIComponent(query.label) : autoMagicQueryLabel(query),
            // remember demo queries won't have sources or collections on the URL
            sources: query.sources ? query.sources.map(s => ({ id: s, media_id: s })) : undefined,
            collections: query.collections ? query.collections.map(s => ({ id: s, tags_id: s })) : undefined,
            q: decodeURIComponent(query.q),
            color: query.color ? decodeURIComponent(query.color) : schemeCategory10[index % 10],
            index,  // redo index to be zero-based on reload of query
            ...extraDefaults, // for demo mode
          }));
        }
        // push the queries in to the store
        saveQueriesFromParsedUrl(queriesFromUrl, isLoggedIn);
      }
      isAllMediaDetailsReady() {
        // we will only render the wrapped component once all the details of the sources and collections
        // have been fetched from the server and put in the right place on each query
        const { queries } = this.props;
        if (queries.length === 0) return false; // need to bail if no queries (ie. first page mount)
        const queryCollectionStatus = queries.map(q => q.collections.length === 0 ||
          q.collections.reduce((combined, c) => combined && c.tag_sets_id !== undefined, true));
        const collectionsAreReady = queryCollectionStatus.reduce((combined, q) => combined && q, true);
        const querySourceStatus = queries.map(q => q.sources.length === 0 ||
          q.sources.reduce((combined, s) => combined && s.name !== undefined, true));
        const sourcesAreReady = querySourceStatus.reduce((combined, q) => combined && q, true);
        return collectionsAreReady && sourcesAreReady;
      }
      render() {
        let content;
        if (this.state.queryInStore) {
          content = <ChildComponent {...this.props} />;
        } else {
          content = <LoadingSpinner />;
        }
        return (
          <div className="serializable-query">
            {content}
          </div>
        );
      }
    }

    UrlBasedQueryContainer.propTypes = {
      intl: PropTypes.object.isRequired,
      location: PropTypes.object,
      // from store
      isLoggedIn: PropTypes.bool.isRequired,
      fetchStatus: PropTypes.string.isRequired,
      samples: PropTypes.array,
      queries: PropTypes.array,
      lastSearchTime: PropTypes.number,
      // from dispatch
      saveQueriesFromParsedUrl: PropTypes.func.isRequired,
      addAppNotice: PropTypes.func.isRequired,
      updateUrl: PropTypes.func.isRequired,
    };

    const mapStateToProps = state => ({
      isLoggedIn: state.user.isLoggedIn,
      fetchStatus: state.explorer.samples.fetchStatus,
      samples: state.explorer.samples.list,
      queries: state.explorer.queries.queries,
      lastSearchTime: state.explorer.lastSearchTime.time,
    });

    // push any updates (including selected) into queries in state, will trigger async load in sub sections
    const mapDispatchToProps = dispatch => ({
      addAppNotice: (info) => {
        dispatch(addNotice(info));
      },
      // handles demo mode by allowing you to pass in extraDefaults
      saveQueriesFromParsedUrl: (queriesToUse, isLoggedIn) => {
        dispatch(selectBySearchParams(queriesToUse)); // load query data into the store
        // lookup ancillary data eg collection and source info for display purposes in QueryForm
        queriesToUse.forEach((q) => {
          const queryInfo = {
            ...q,
          };
          const sourceDetailsAction = isLoggedIn ? fetchQuerySourcesByIds : demoQuerySourcesByIds;
          if (q.sources && q.sources.length > 0) {
            queryInfo.sources = q.sources.map(src => src.media_id || src.id || src); // the latter in case of sample search
            dispatch(sourceDetailsAction(queryInfo))
            .then((results) => {
              queryInfo.sources = results;
              dispatch(updateQuerySourceLookupInfo(queryInfo)); // updates the query and the selected query
            });
          }
          const collectionDetailsAction = isLoggedIn ? fetchQueryCollectionsByIds : demoQueryCollectionsByIds;
          if (q.collections && q.collections.length > 0) {
            queryInfo.collections = q.collections.map(coll => coll.tags_id || coll.id || coll); // the latter in case of sample search
            dispatch(collectionDetailsAction(queryInfo))
            .then((results) => {
              queryInfo.collections = results;
              dispatch(updateQueryCollectionLookupInfo(queryInfo)); // updates the query and the selected query
            });
          }
        });
      },
      asyncFetch: () => {
        dispatch(fetchSampleSearches());   // inefficient: we need the sample searches loaded just in case
      },
      updateUrl: (queries, isLoggedIn) => {
        const unDeletedQueries = queries.filter(q => q.deleted !== true);
        const nonEmptyQueries = unDeletedQueries.filter(q => q.q !== undefined && q.q !== '');
        if (!isLoggedIn) {
          const urlParamString = nonEmptyQueries.map((q, idx) => `{"index":${idx},"q":"${encodeURIComponent(q.q)}","color":"${encodeURIComponent(q.color)}"}`);
          const newLocation = `/queries/demo/search/[${urlParamString}]`;
          dispatch(push(newLocation));
        } else {
          const urlParamString = generateQueryParamString(unDeletedQueries);
          const newLocation = `/queries/search/${urlParamString}`;
          dispatch(push(newLocation));
        }
      },
    });

    return injectIntl(
      connect(mapStateToProps, mapDispatchToProps)(
        composeAsyncContainer(
          UrlBasedQueryContainer
        )
      )
    );
  };
}

export default composeUrlBasedQueryContainer;
