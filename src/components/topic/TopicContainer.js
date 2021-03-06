import PropTypes from 'prop-types';
import React from 'react';
import Title from 'react-title-component';
import { replace } from 'react-router-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { filteredLocation, urlWithFilters } from '../util/location';
import composeAsyncContainer from '../common/AsyncContainer';
import AppButton from '../common/AppButton';
import { selectTopic, filterBySnapshot, filterByTimespan, filterByFocus, fetchTopicSummary, filterByQuery,
  topicStartSpider } from '../../actions/topicActions';
import { addNotice, setSubHeaderVisible } from '../../actions/appActions';
import { snapshotIsUsable, TOPIC_SNAPSHOT_STATE_COMPLETED, TOPIC_SNAPSHOT_STATE_QUEUED, TOPIC_SNAPSHOT_STATE_RUNNING,
  TOPIC_SNAPSHOT_STATE_ERROR, TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED } from '../../reducers/topics/selected/snapshots';
import { LEVEL_INFO, LEVEL_WARNING, LEVEL_ERROR } from '../common/Notice';
import TopicUnderConstruction from './TopicUnderConstruction';

const localMessages = {
  needsSnapshotWarning: { id: 'needSnapshot.warning', defaultMessage: 'You\'ve made changes to your Topic that require a new snapshot to be generated!' },
  snapshotBuilderLink: { id: 'needSnapshot.snapshotBuilderLink', defaultMessage: 'Visit the Snapshot Builder for details.' },
  hasAnError: { id: 'topic.hasError', defaultMessage: 'Sorry, this topic has an error!' },
  spiderQueued: { id: 'topic.spiderQueued', defaultMessage: 'This topic is in the queue for spidering stories.  Please reload after a bit to see if it has started spidering.' },
  snapshotQueued: { id: 'snapshotGenerating.warning.queued', defaultMessage: 'We will start creating the new snapshot soon. Please reload this page in a minute to automatically see the freshest data.' },
  snapshotRunning: { id: 'snapshotGenerating.warning.running', defaultMessage: 'We are creating a new snapshot right now. Please reload this page in a minute to automatically see the freshest data.' },
  snapshotImporting: { id: 'snapshotGenerating.warning.importing', defaultMessage: 'We are importing the new snapshot now. Please reload this page in a minute to automatically see the freshest data.' },
  snapshotFailed: { id: 'snapshotFailed.warning', defaultMessage: 'We tried to generate a new snapshot, but it failed.' },
  topicRunning: { id: 'topic.topicRunning', defaultMessage: 'We are scraping the web for all the stories in include in your topic.' },
  notUsingLatestSnapshot: { id: 'topic.notUsingLatestSnapshot', defaultMessage: 'You are not using the latest snapshot!  If you are not doing this on purpose, <a href="{url}">switch to the latest snapshot</a> to get the best data.' },
  otherError: { id: 'topic.state.otherError', defaultMessage: 'Sorry, this topic has an error.  It says it is "{state}".' },
  trySpidering: { id: 'topic.state.trySpidering', defaultMessage: 'Manually run this topic' },
};

class TopicContainer extends React.Component {
  componentWillMount() {
    const { needsNewSnapshot, addAppNotice } = this.props;
    const { formatMessage } = this.props.intl;
    // warn user if they made changes that require a new snapshot
    if (needsNewSnapshot) {
      addAppNotice({ level: LEVEL_WARNING, message: formatMessage(localMessages.needsSnapshotWarning) });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { topicId, topicInfo, asyncFetch, needsNewSnapshot, addAppNotice } = this.props;
    const { formatMessage } = this.props.intl;
    // if they edited the topic, or the topic changed then reload (unless it is just a isFav change)
    let topicInfoHasChanged = false;
    Object.keys(topicInfo).forEach((key) => {
      if ((key !== 'isFavorite') && (topicInfo[key] !== nextProps.topicInfo[key])) {
        topicInfoHasChanged = true;
      }
    });
    if (topicInfoHasChanged || (nextProps.topicId !== topicId)) {
      asyncFetch();
      // warn user if they made changes that require a new snapshot
      if (needsNewSnapshot) {
        addAppNotice({ level: LEVEL_WARNING, message: formatMessage(localMessages.needsSnapshotWarning) });
      }
    }
  }
  componentWillUnmount() {
    const { removeTopicId } = this.props;
    removeTopicId();
  }
  filtersAreSet() {
    const { filters, topicId } = this.props;
    return ((topicId !== null) && (filters.snapshotId !== null) && (filters.timespanId !== null));
  }
  render() {
    const { children, topicInfo, snapshotCount, handleSpiderRequest } = this.props;
    const { formatMessage } = this.props.intl;
    const titleHandler = parentTitle => `${topicInfo.name} | ${parentTitle}`;
    // show a big error if there is one to show
    let contentToShow = children;
    if ((topicInfo.state === TOPIC_SNAPSHOT_STATE_RUNNING) && (snapshotCount === 0)) {
      // if the topic is running the initial spider and then show under construction message
      contentToShow = (<TopicUnderConstruction />);
    } else if (topicInfo.state === TOPIC_SNAPSHOT_STATE_CREATED_NOT_QUEUED) {
      contentToShow = (
        <Grid>
          <Row>
            <Col lg={12}>
              <div className="topic-created-not-queued-error">
                <h1><FormattedMessage {...localMessages.hasAnError} /></h1>
                <AppButton
                  label={formatMessage(localMessages.trySpidering)}
                  onTouchTap={() => handleSpiderRequest(topicInfo.topics_id)}
                  type="submit"
                  primary
                />
              </div>
            </Col>
          </Row>
        </Grid>
      );
    }
    return (
      <div className="topic-container">
        <div>
          <Title render={titleHandler} />
          {contentToShow}
        </div>
      </div>
    );
  }
}

TopicContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  children: PropTypes.node,
  location: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  addAppNotice: PropTypes.func.isRequired,
  removeTopicId: PropTypes.func.isRequired,
  handleSpiderRequest: PropTypes.func.isRequired,
  // from state
  filters: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  topicInfo: PropTypes.object,
  needsNewSnapshot: PropTypes.bool.isRequired,
  snapshotCount: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  filters: state.topics.selected.filters,
  fetchStatus: state.topics.selected.info.fetchStatus,
  topicInfo: state.topics.selected.info,
  topicId: parseInt(ownProps.params.topicId, 10),
  needsNewSnapshot: state.topics.selected.needsNewSnapshot,
  snapshotCount: state.topics.selected.snapshots.list.length,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  addAppNotice: (info) => {
    dispatch(addNotice(info));
  },
  removeTopicId: () => {
    dispatch(selectTopic(null));
    dispatch(setSubHeaderVisible(false));
  },
  asyncFetch: () => {
    dispatch(selectTopic(ownProps.params.topicId));
    // select any filters that are serialized on the url
    const query = ownProps.location.query;
    const snapshotId = ownProps.location.query.snapshotId;
    if (snapshotId) {
      dispatch(filterBySnapshot(query.snapshotId));
    }
    if (ownProps.location.query.focusId) {
      dispatch(filterByFocus(query.focusId));
    }
    if (ownProps.location.query.timespanId) {
      dispatch(filterByTimespan(query.timespanId));
    }
    if (ownProps.location.query.q) {
      dispatch(filterByQuery(query.q));
    }
    // now that filters are set, fetch the topic summary info
    dispatch(fetchTopicSummary(ownProps.params.topicId))
      .then((response) => {
        // show the subheader info
        dispatch(setSubHeaderVisible(true));
        // show any warnings based on the topic state
        switch (response.state) {
          case TOPIC_SNAPSHOT_STATE_QUEUED:
            dispatch(addNotice({
              level: LEVEL_INFO,
              message: ownProps.intl.formatMessage(localMessages.spiderQueued),
            }));
            break;
          case TOPIC_SNAPSHOT_STATE_RUNNING:
            dispatch(addNotice({
              level: LEVEL_INFO,
              message: ownProps.intl.formatMessage(localMessages.topicRunning),
              details: response.message,
            }));
            break;
          case TOPIC_SNAPSHOT_STATE_ERROR:
            dispatch(addNotice({
              level: LEVEL_ERROR,
              message: ownProps.intl.formatMessage(localMessages.hasAnError),
              details: response.message,
            }));
            break;
          case TOPIC_SNAPSHOT_STATE_COMPLETED:
            // everything is ok
            break;
          default:
            // got some unknown bad state
            dispatch(addNotice({
              level: LEVEL_ERROR,
              message: ownProps.intl.formatMessage(localMessages.otherError, { state: response.state }),
            }));
            break;
        }
        // show any warnings based on the snapshot state
        const snapshots = response.snapshots.list;
        const snapshotJobStatus = response.snapshots.jobStatus;
        const firstReadySnapshot = snapshots.find(s => snapshotIsUsable(s));
        // if no snapshot specified, pick the first usable snapshot
        if ((snapshotId === null) || (snapshotId === undefined)) {
          // default to the latest ready snapshot if none is specified on url
          if (firstReadySnapshot) {
            const newSnapshotId = firstReadySnapshot.snapshots_id;
            const newLocation = filteredLocation(ownProps.location, {
              snapshotId: newSnapshotId,
              timespanId: null,
              focusId: null,
              q: null,
            });
            dispatch(replace(newLocation)); // do a replace, not a push here so the non-snapshot url isn't in the history
            dispatch(filterBySnapshot(newSnapshotId));
          } else if (snapshots.length > 0) {
            // first snapshot doesn't show up as a job, so we gotta check for status here and alert if it is importing :-(
            const firstSnapshot = snapshots[0];
            if (!snapshotIsUsable(firstSnapshot)) {
              dispatch(addNotice({
                level: LEVEL_INFO,
                message: ownProps.intl.formatMessage(localMessages.snapshotImporting),
              }));
            }
          }
        } else if (firstReadySnapshot.snapshots_id !== parseInt(snapshotId, 10)) {
          // if snaphot is specific in URL, but it is not the latest then show a warning
          dispatch(addNotice({
            level: LEVEL_WARNING,
            htmlMessage: ownProps.intl.formatHTMLMessage(localMessages.notUsingLatestSnapshot, {
              url: urlWithFilters(ownProps.location.pathname, {
                snapshotId: firstReadySnapshot.snapshots_id,
              }),
            }),
          }));
        }
        // if a snapshot is in progress then show the user a note about its state
        if (snapshotJobStatus && snapshotJobStatus.length > 0) {
          const latestSnapshotJobStatus = response.snapshots.jobStatus[0];
          switch (latestSnapshotJobStatus.state) {
            case TOPIC_SNAPSHOT_STATE_QUEUED:
              dispatch(addNotice({
                level: LEVEL_INFO,
                message: ownProps.intl.formatMessage(localMessages.snapshotQueued),
                details: latestSnapshotJobStatus.message,
              }));
              break;
            case TOPIC_SNAPSHOT_STATE_RUNNING:
              dispatch(addNotice({
                level: LEVEL_INFO,
                message: ownProps.intl.formatMessage(localMessages.snapshotRunning),
                details: latestSnapshotJobStatus.message,
              }));
              break;
            case TOPIC_SNAPSHOT_STATE_ERROR:
              dispatch(addNotice({
                level: LEVEL_ERROR,
                message: ownProps.intl.formatMessage(localMessages.snapshotFailed),
                details: latestSnapshotJobStatus.message,
              }));
              break;
            case TOPIC_SNAPSHOT_STATE_COMPLETED:
              const latestSnapshot = snapshots[0];
              if (!snapshotIsUsable(latestSnapshot)) {
                dispatch(addNotice({
                  level: LEVEL_INFO,
                  message: ownProps.intl.formatMessage(localMessages.snapshotImporting),
                }));
              }
              break;
            default:
              // don't alert user about anything
          }
        } else if (snapshots.length > 1) {
          // for some reason the second snapshot isn't showing up in the jobs list
          const latestSnapshot = snapshots[0];
          if (!snapshotIsUsable(latestSnapshot)) {
            dispatch(addNotice({
              level: LEVEL_INFO,
              message: ownProps.intl.formatMessage(localMessages.snapshotImporting),
            }));
          }
        }
      });
  },
  handleSpiderRequest: (topicId) => {
    dispatch(topicStartSpider(topicId))
      .then(() => window.location.reload());
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
        composeAsyncContainer(
          TopicContainer
        )
      )
  );
