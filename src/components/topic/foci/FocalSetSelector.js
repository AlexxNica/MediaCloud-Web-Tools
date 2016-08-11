import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import FocalSetSummary from './FocalSetSummary';

const localMessages = {
  title: { id: 'focus.techniquePicker.title', defaultMessage: 'Pick a Focal Set' },
  about: { id: 'focus.techniquePicker.about',
    defaultMessage: 'Your Focus must belong to a Focal Set. All the Foci within a Focal Set share the same Focal Technique. Our tools lets you compare Foci with a Focal Set, but they don\'t let you easily compare Foci in different Focal Sets.' },
  newFocalSetName: { id: 'focus.techniquePicker.new.name', defaultMessage: 'Create a New Focal Set' },
  newFocalSetDescription: { id: 'focus.techniquePicker.new.description', defaultMessage: 'Pick this if you want to make a new Focal Set for this Focus.' },
};

export const NEW_FOCAL_SET_PLACEHOLDER_ID = -1;

class FocalSetSelector extends React.Component {

  handleClick = (focalSetId) => {
    const { onSelected } = this.props;
    onSelected(focalSetId);
  }

  handleSelectNew = () => {
    this.handleSelect(NEW_FOCAL_SET_PLACEHOLDER_ID);
  }

  handleSelect = (id) => {
    const { onSelected } = this.props;
    onSelected(id);
  }

  render() {
    const { focalSets, selected } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <Row>
          <Col lg={10} md={10} sm={10}>
            <h3><FormattedMessage {...localMessages.title} /></h3>
            <p><FormattedMessage {...localMessages.about} /></p>
          </Col>
        </Row>
        <Row>
          {focalSets.map(focalSet =>
            <FocalSetSummary
              selected={(selected === focalSet.focal_sets_id)}
              key={focalSet.focal_sets_id}
              focalSet={focalSet}
              onClick={this.handleClick}
            />
          )}
          <FocalSetSummary key={NEW_FOCAL_SET_PLACEHOLDER_ID}
            selected={(selected === NEW_FOCAL_SET_PLACEHOLDER_ID)}
            focalSet={{
              id: NEW_FOCAL_SET_PLACEHOLDER_ID,
              name: formatMessage(localMessages.newFocalSetName),
              description: formatMessage(localMessages.newFocalSetDescription),
            }}
            onClick={this.handleSelectNew}
          />
        </Row>
      </div>
    );
  }

}

FocalSetSelector.propTypes = {
  focalSets: React.PropTypes.array.isRequired,
  selected: React.PropTypes.number,
  onSelected: React.PropTypes.func.isRequired,
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    FocalSetSelector
  );
