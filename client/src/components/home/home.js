// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getPins, updatePin } from '../../actions/pinactions';
import ImageBuild from '../imagebuild/imagebuild';
import PinZoom from '../modal/modalzoom';
import SignIn from '../signin/signin';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
      displayPinZoom: false, // for zoom modal
      imageInfo: [], // to send to zoom modal
      imagesLoaded: false, // masonry callback
      displaySignIn: false,
    };
  }

  componentDidMount() {
    getPins('All').then((pinsFromDB) => { // get all pins then setstate
      console.log(pinsFromDB);
      this.setState({
        pinList: this.shuffleImages([...pinsFromDB]),
      });
    });
  }

  onBrokenImage = (id) => {
    const { pinList } = this.state;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfDeletion = pinListCopy.findIndex(p => p._id === id);
    pinListCopy = [...pinListCopy.slice(0, indexOfDeletion),
      ...pinListCopy.slice(indexOfDeletion + 1)];
    this.setState({
      pinList: pinListCopy,
    });
  }

  shuffleImages = (arr) => {
    const shuffled = [];
    while (arr.length) {
      const randIndex = Math.floor(Math.random() * arr.length);
      const [removed] = arr.splice(randIndex, 1);
      shuffled.push(removed);
    }
    return shuffled;
  }

  layoutComplete = () => {
    const { imagesLoaded } = this.state;
    if (imagesLoaded) return;
    this.setState({ imagesLoaded: true });
  }

  imageStatus = (element) => {
    if (element.hasSaved || element.owns) {
      return null;
    }
    // user has not saved this pin show save button
    return (
      <button
        type="submit"
        className="actionbutton save"
        onClick={() => this.savePic(element)}
      >
        <i className="fa fa-thumb-tack" aria-hidden="true" />
        {' Save'}
      </button>
    );
  }

  pinEnlarge = (e, currentImg) => { // calls zoom in modal for the clicked picture
    const { displayPinZoom } = this.state;
    if (e.target.type === 'submit') return;
    if (displayPinZoom) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg, this.imageStatus(currentImg), e.pageY - e.clientY],
    });
  }

  savePic(element) { // saves a pic owned by somebody else into current users profile
    // can not do this unless logged in
    const {
      user: {
        displayname, username, service, userID,
      },
    } = this.props;
    const { pinList } = this.state;
    if (username === 'Guest') {
      this.setState({
        displaySignIn: true,
        displayPinZoom: false,
      });
      return;
    }
    // copy pinlist --> avoid mutation at all cost
    const pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfUpdate = pinListCopy.findIndex(p => p._id === element._id);
    // add current pinner info to saved by array of pin
    const newPinnerInfo = {
      name: displayname,
      service,
      id: userID,
    };
    const updated = [...element.savedBy, displayname];
    // update client then update db
    pinListCopy[indexOfUpdate].savedBy = updated;
    pinListCopy[indexOfUpdate].hasSaved = true;
    this.setState({
      pinList: pinListCopy,
      displayPinZoom: false,
    }, () => updatePin(element._id, newPinnerInfo));
  }


  render() {
    const { user: { authenticated, username } } = this.props;
    const {
      displayPinZoom, imageInfo, pinList, imagesLoaded, displaySignIn,
    } = this.state;
    const userStatus = username !== null;
    console.log("User status = ", userStatus)
    return (
      <React.Fragment>
        <ImageBuild
          layoutComplete={this.layoutComplete}
          pinEnlarge={this.pinEnlarge}
          onBrokenImage={this.onBrokenImage}
          status={this.imageStatus}
          pinList={pinList}
          imagesLoaded={imagesLoaded}
        />
        <PinZoom
          message={displayPinZoom}
          reset={() => this.setState({ displayPinZoom: false })}
          zoomInfo={imageInfo}
        />
        <div className={displayPinZoom ? 'modal-overlay' : ''} />
      </React.Fragment>
    );
  }

}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(Home);

Home.defaultProps = {
  user: {},
};

Home.propTypes = {
  // authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
};
