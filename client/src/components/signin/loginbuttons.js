import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './loginbuttons.scss';

const mapStateToProps = state => state;


class LoginButtons extends React.Component {

    handleLogin = (loc) => { // twitter/ google authentication
      window.location = loc;
    }

    render() {
      return (
        <React.Fragment>
          <button
            type="submit"
            id="googleloginbutton"
            onClick={() => this.handleLogin('/auth/google')}
          >
            <span id="twitter">
              <i className="fa fa-google" aria-hidden="true" />
            </span>
            <span className="buttontext">
              {'Continue With Google'}
            </span>
          </button>
        </React.Fragment>
      );
    }

}

export default connect(mapStateToProps)(LoginButtons);

LoginButtons.propTypes = {
  // redux action to set guest user status on server
  setGuest: PropTypes.func.isRequired,
  // used for reseting back to guest mode in signin
  guest: PropTypes.func.isRequired,
};
