import React from 'react';
import { connect } from 'react-redux';
import composeAsyncContainer from '../common/AsyncContainer';
import { fetchNotebookClippings } from '../../actions/notebookActions';
import ClippingList from './ClippingList';

const ClippingListContainer = props => (
  <ClippingList clippings={props.clippings} />
);

ClippingListContainer.propTypes = {
  intl: React.PropTypes.object.isRequired,
  // from parent
  app: React.PropTypes.string,
  // from state
  clippings: React.PropTypes.object.isRequired,
  fetchStatus: React.PropTypes.string.isRequired,
  // from dipatch
  asyncFetch: React.PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.stats.fetchStatus,
  clippings: state.notebook.clippings,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    const params = {};
    if (ownProps.app !== undefined) {
      params.app = ownProps.app;
    }
    dispatch(fetchNotebookClippings(params));
  },
});

export default
  connect(mapStateToProps, mapDispatchToProps)(
    composeAsyncContainer(
      ClippingListContainer
    )
  );
