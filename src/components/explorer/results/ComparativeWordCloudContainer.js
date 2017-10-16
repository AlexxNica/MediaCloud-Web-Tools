import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import composeAsyncContainer from '../../common/AsyncContainer';
import DataCard from '../../common/DataCard';
import { fetchQueryTopWords, fetchDemoQueryTopWords } from '../../../actions/explorerActions';
import { generateParamStr } from '../../../lib/apiUtil';
import { queryPropertyHasChanged } from '../../../lib/explorerUtil';
import { getBrandDarkColor } from '../../../styles/colors';
import ComparativeOrderedWordCloud from '../../vis/ComparativeOrderedWordCloud';
import OrderedWordCloud from '../../vis/OrderedWordCloud';
import WordSelectWrapper from './WordSelectWrapper';

const localMessages = {
  title: { id: 'explorer.comparativeWords.title', defaultMessage: 'Comparative Words' },
  intro: { id: 'explorer.comparativeWords.intro', defaultMessage: ' These words are the most used in each query. They are sized according to total count across all words in ...' },
  leftTitleMsg: { id: 'explorer.comparativeWords.left', defaultMessage: 'Comparative Words' },
  centerTitleMsg: { id: 'explorer.comparativeWords.center', defaultMessage: 'Comparative Words' },
  rightTitleMsg: { id: 'explorer.comparativeWords.right', defaultMessage: 'Comparative Words' },

};

class ComparativeWordCloudContainer extends React.Component {
  componentWillMount() {
    const { queries } = this.props;
    const leftQ = queries[0];
    const rightQ = queries.length > 1 ? queries[1] : queries[0];
    this.setState({ leftQuery: leftQ, rightQuery: rightQ });
  }
  componentWillReceiveProps(nextProps) {
    const { lastSearchTime, fetchData } = this.props;
    if (nextProps.lastSearchTime !== lastSearchTime) {
      fetchData([this.state.leftQuery, this.state.rightQuery]);
    }
  }
  shouldComponentUpdate(nextProps) {
    const { results, queries } = this.props;
    // only re-render if results, any labels, or any colors have changed
    if (results.length) { // may have reset results so avoid test if results is empty
      const labelsHaveChanged = queryPropertyHasChanged(queries.slice(0, results.length), nextProps.queries.slice(0, results.length), 'label');
      const colorsHaveChanged = queryPropertyHasChanged(queries.slice(0, results.length), nextProps.queries.slice(0, results.length), 'color');
      return (
        ((labelsHaveChanged || colorsHaveChanged))
         || (results !== nextProps.results)
      );
    }
    return false; // if both results and queries are empty, don't update
  }

  componentWillUnmount() {
    this.setState({ leftQuery: '', rightQuery: '' });
  }
  downloadCsv = (query) => {
    let url = null;
    if (parseInt(query.searchId, 10) >= 0) {
      url = `/api/explorer/sentences/count.csv/${query.searchId}/${query.index}`;
    } else {
      url = `/api/explorer/sentences/count.csv/[{"q":"${query.q}"}]/${query.index}`;
    }
    window.location = url;
  }

  render() {
    const { queries, results, handleWordCloudClick, fetchData } = this.props;
    // test the results before we pass to cowc, are there two valid sets of arrays
    // const mergedResultsWithQueryInfo = results.map((r, idx) => Object.assign({}, r, queries[idx]));
    if (results && results.length === 1) {
      return (
        <Grid>
          <h2><FormattedMessage {...localMessages.title} /></h2>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <h1><FormattedMessage {...localMessages.title} /></h1>
              <p><FormattedMessage {...localMessages.intro} /></p>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <DataCard>
                <OrderedWordCloud
                  words={results[0]}
                  // alreadyNormalized
                  width={390}
                />
              </DataCard>
            </Col>
          </Row>
        </Grid>
      );
    } else if (results && results.length > 0) {
      return (
        <Grid>
          <h2><FormattedMessage {...localMessages.title} /></h2>
          <Row>
            <Col lg={12} md={12} sm={12}>
              <h1><FormattedMessage {...localMessages.title} /></h1>
              <p><FormattedMessage {...localMessages.intro} /></p>
            </Col>
          </Row>
          <WordSelectWrapper queries={queries} fetchComparedQueries={() => fetchData()} />
          <Row>
            <Col lg={12}>
              <DataCard>
                <ComparativeOrderedWordCloud
                  leftWords={results[0]}
                  rightWords={results[1]}
                  textColor={getBrandDarkColor()}
                  onWordClick={handleWordCloudClick}
                  leftTitleMsg={localMessages.leftTitleMsg}
                  centerTitleMsg={localMessages.centerTitleMsg}
                  rightTitleMsg={localMessages.rightTitleMsg}
                />
              </DataCard>
            </Col>
          </Row>
        </Grid>
      );
    }
    return <div>Error</div>;
  }

}

ComparativeWordCloudContainer.propTypes = {
  lastSearchTime: React.PropTypes.number.isRequired,
  queries: React.PropTypes.array.isRequired,
  // from composition
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  fetchData: React.PropTypes.func.isRequired,
  results: React.PropTypes.array.isRequired,
  // from mergeProps
  asyncFetch: React.PropTypes.func.isRequired,
  // from state
  fetchStatus: React.PropTypes.string.isRequired,
  handleWordCloudClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  user: state.user,
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.list,
});

const mapDispatchToProps = (dispatch, state) => ({
  fetchData: (queries) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query
    // dispatch(resetTopWords()); // necessary if a query deletion has occurred
    if (state.user.isLoggedIn) {
      const runTheseQueries = queries || state.queries;
      const comparedQueries = runTheseQueries.map(q => ({
        start_date: q.startDate,
        end_date: q.endDate,
        q: q.q,
        index: q.index,
        sources: q.sources.map(s => s.id),
        collections: q.collections.map(c => c.id),
      }));
      return dispatch(fetchQueryTopWords(comparedQueries[0], comparedQueries[1]));
    }
    const runTheseQueries = queries || state.queries;
    const comparedQueries = runTheseQueries.map(q => ({
      index: q.index, // should be same as q.index btw
      search_id: q.searchId, // may or may not have these
      query_id: q.id, // could be undefined
      q: q.q, // only if no query id, means demo user added a keyword
    }));
    return dispatch(fetchDemoQueryTopWords(comparedQueries[0], comparedQueries[1]));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    handleWordCloudClick: (word) => {
      const params = generateParamStr({ ...stateProps.filters, stem: word.stem, term: word.term });
      const url = `/topics/${stateProps.topicId}/words/${word.stem}*?${params}`;
      dispatchProps.goToUrl(url);
    },
    asyncFetch: () => {
      if (ownProps.queries && ownProps.queries.length > 0) {
        if (ownProps.queries.length > 1) {
          dispatchProps.fetchData([ownProps.queries[0], ownProps.queries[1]]);
        } else {
          dispatchProps.fetchData([ownProps.queries[0]]);
        }
      }
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeAsyncContainer(
        ComparativeWordCloudContainer
      )
    )
  );