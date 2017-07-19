import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../../common/AsyncContainer';
import { fetchCollectionList } from '../../../../actions/sourceActions';
import CollectionTable from './CollectionTable';
import { TAG_SET_EMM_ID } from '../../../../lib/tagUtil';

const EMMCollectionListContainer = (props) => {
  const { name, description, collections } = props;
  return (
    <div className="mc-collections-table">
      <CollectionTable
        collections={collections}
        title={name}
        description={description}
      />
    </div>
  );
};

EMMCollectionListContainer.propTypes = {
  // from state
  collections: React.PropTypes.array.isRequired,
  name: React.PropTypes.string,
  description: React.PropTypes.string,
  fetchStatus: React.PropTypes.string.isRequired,
  // from context
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: React.PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.all.fetchStatus,
  name: state.sources.collections.all.name,
  description: state.sources.collections.all.description,
  collections: state.sources.collections.all.collections,
});

const mapDispatchToProps = dispatch => ({
  asyncFetch: () => {
    dispatch(fetchCollectionList(TAG_SET_EMM_ID));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        EMMCollectionListContainer
      )
    )
  );
