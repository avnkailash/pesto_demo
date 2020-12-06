// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUser } from '../../actions/authentication';
import SignIn from '../signin/signin';
import './menu.scss';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getUser,
  }, dispatch)
);


class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ready: false, // component ready for render
      initialLoad: true, // used to avoid keyframe anim on initial load
      menuIsCollapsed: window.innerWidth < 600, // test for screen size
      collapseToggle: false, // turns responsive hamburger on/off
      displaySignIn: false,
    };
  }

  componentDidMount() {
    const { getUser: getUserStatus } = this.props;
    getUserStatus();
    this.setState(
      {
        menuIsCollapsed: window.innerWidth < 600,
        collapseToggle: false,
        initialLoad: true,
      },
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;
    const { collapseToggle, initialLoad } = this.state;
    if (prevProps.user !== user) {
      this.setState({ ready: true }); // once user info comes from cdm proceed to rendering
    }
    if (prevState.collapseToggle === false && collapseToggle) {
      // don't display responsive menu on initial load
      if (initialLoad) this.setState({ initialLoad: false });
      window.addEventListener('click', this.listenForOutClicks);
    }
    if (prevState.collapseToggle === true && !collapseToggle) {
      window.removeEventListener('click', this.listenForOutClicks);
    }
  }

  listenForOutClicks = (e) => {
    // clicks outside an extended menu will collpase it
    if (!e.target.closest('.menu')) this.toggleCollapse();
  }

  toggleCollapse = () => {
    // burger click handler for responsive mode
    const { collapseToggle } = this.state;
    this.setState({ collapseToggle: !collapseToggle });
  }

  handleLogin = (loc) => { // google authentication
    window.location = loc;
  }

  collapsedMenu = () => (
    <div className="items collapsed burger">
      <i
        className="fa fa-bars"
        aria-hidden="true"
        onClick={this.toggleCollapse}
      />
    </div>
  )

  render() {
    // render cover/guest / logged in menu bar
    const {
      menuIsCollapsed, collapseToggle, ready, initialLoad, displaySignIn,
    } = this.state;
    const { user: { authenticated, username } } = this.props;
    if (!ready) return null;
    console.log("Authentication Status = ", authenticated);
    if (!authenticated) {
      // render guest menu bar
      return (
        <div className="menu">
          <div className="brand">
            <a href="/">
              {'Pesto Demo'}
            </a>
          </div>
          <div className="items signin">
          <button
            type="submit"
            id="googleloginbutton"
            onClick={() => this.handleLogin('/auth/google')}
          >
            <span id="google">
              <i className="fa fa-sign-in" aria-hidden="true" />
            </span>
            <span className="buttontext">
              {'Login with Google'}
            </span>
          </button>
          </div>
          <SignIn
            show={displaySignIn}
            removeSignin={() => this.setState({ displaySignIn: false })}
            caller="menu"
          />
        </div>
      );
    }
    // render authenticated menu bar
    return (
      <React.Fragment>
        <div className="menu">
          <div className="brand">
            <a href="/">
              {'Pesto Demo'}
            </a>
          </div>
          {
            !menuIsCollapsed
              ? (
                <div className="items extended">
                  <NavLink exact to="/">Home</NavLink>
                  <NavLink exact to="/pins">My Pins</NavLink>
                  <NavLink to="/logout" onClick={() => window.location.assign('auth/logout')}>Logout</NavLink>
                </div>
              )
              : this.collapsedMenu()
          }
        </div>

      </React.Fragment>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  // stored authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
  // redux action to get user status from server
  getUser: PropTypes.func.isRequired,
};
