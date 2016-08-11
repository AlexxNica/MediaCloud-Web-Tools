import React from 'react';
import { connect } from 'react-redux';
import CreateFocusControlBar from './CreateFocusControlBar';
import CreateFocusSetUp from './CreateFocusSetUp';

const CreateFocusContainer = (props) => {
  const { topicId, currentStep } = props;
  const steps = [CreateFocusSetUp];
  const CurrentStepComponent = steps[currentStep];
  return (
    <div>
      <CreateFocusControlBar topicId={topicId} currentStep={currentStep} />
      <CurrentStepComponent topicId={topicId} />
    </div>
  );
};

CreateFocusContainer.propTypes = {
  // from context:
  topicId: React.PropTypes.number.isRequired,
  // from state
  currentStep: React.PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  currentStep: state.topics.selected.focalSets.create.currentStep,
});

export default connect(
  mapStateToProps,
  null
)(CreateFocusContainer);
