// only getuser action dispatches to store
import axios from 'axios';

// action gets user authentication status from /profile that is generated
// and updates store
export const getUser = () => dispatch => (
  axios.get('/auth/profile')
    .then((response) => {
      console.log(response);
      dispatch({
        type: 'GET_USER_STATUS',
        payload: response.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: 'GET_USER_STATUS_REJECTED',
        payload: err,
      });
    })
);
