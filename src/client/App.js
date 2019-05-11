import React from 'react';
import { connect } from 'react-redux';
import { CSSTransitionGroup } from 'react-transition-group';

import { showLoadingMessage, showErrorMessage, hideLoadingMessage, getErrorMessage } from './components/Store/Actions.js';

import TopNavBar from './components/TopNavBar/TopNavBar';
import Tab from './components/Tab/Tab';
import MessageComp from './components/MessageComp/MessageComp';
import SettingsBar from './components/SettingsBar/SettingsBar';

import styles from './styles/App.scss';
import fade from './styles/transitions/fade.scss';
import scale from './styles/transitions/scale.scss';

const mapStateToProps = state => {
  return {
    showLoadingMessage: state.toggleLoadingMessage,
    showErrorMessage: state.toggleErrorMessage,
    errorMessage: state.toggleErrorMessage,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadingMessageOn: () => dispatch(showLoadingMessage()),
    loadingMessageOff: () => dispatch(hideLoadingMessage()),
    errorMessageOn: () => dispatch(showErrorMessage()),
    getErrorMessage: message => dispatch(getErrorMessage(message)),
  }
}

class ConnectedApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: '',
      parameter: '',
      fetchRequestStatus: undefined,
      contracts: [],
      settingsVisible: false,
    }

    this.handleMenuItemIconClick = this.handleMenuItemIconClick.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  handleMenuItemIconClick(index) {
    const { contracts } = this.state;
    const newTabs = contracts.filter((item, i) => i !== index);

    this.setState({
      contracts: newTabs,
    });
  }

  handleInputChange(event) {

    const { value } = event.target;

    this.setState({
      inputValue: value,
      parameter: value,
    });
  }

  handleInputSubmit() {
    const { inputValue, parameter } = this.state;

    this.setState({
      parameter: inputValue,
      settingsVisible: false,
    });

    this.fetchData(parameter);
  }

  fetchData(parameter) {
    this.handleRequestPending();

    fetch(`http://localhost:9090/files/${encodeURIComponent(parameter) || ' '}?extension=sol`)
      .then(res => res.json())
      .then(data => {
        data.error 
        ? this.handleRequestFail(data.message) 
        : this.handleRequestSuccess(data);      
      })
      .catch(err => this.handleRequestFail(err))
      ;
  }

  handleRequestPending() {
    this.props.loadingMessageOn();
  }

  handleRequestSuccess(response) {
    this.setState({
      fetchRequestStatus: 'success',
      contracts: response,
    });

    this.props.loadingMessageOff();
  }

  handleRequestFail(message) {
    this.props.loadingMessageOff();
    this.props.errorMessageOn();
    this.props.getErrorMessage(message);
  }

  handleSettingsiconClick() {
    this.toggleOutsideClick();

    this.setState(prevState => ({
      settingsVisible: !prevState.settingsVisible,
    }))
  }

  handleSettingsSaveButtonClick() {
    this.toggleOutsideClick();

    this.setState({
      settingsVisible: false,
    });
  }

  toggleOutsideClick() {
    if (!this.state.settingsVisible) {
      document.addEventListener('click', this.handleOutsideClick);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  handleOutsideClick(e) {
    if (this.node.contains(e.target)) {
      return;
    }

    document.removeEventListener('click', this.handleOutsideClick);
  
    this.setState({
      settingsVisible: false,
    });
  }

  render() {

    const { fetchRequestStatus, contracts, settingsVisible, configPlaceholder } = this.state;
    const { children, showLoadingMessage, showErrorMessage, errorMessage } = this.props;

    return (
      <div className={styles['app']}>
        <TopNavBar
          onInputChange={(e) => this.handleInputChange(e)}
          onInputSubmit={() => this.handleInputSubmit()}
          onIconClick={() => this.handleSettingsiconClick()}
        />
        <div ref={node => { this.node = node; }}>
          <SettingsBar 
            active={!!settingsVisible}
            onSaveButtonClick={() => this.handleSettingsSaveButtonClick()}
          />
        </div>
        <CSSTransitionGroup
          transitionName={fade}
          transitionAppear={true}
          transitionAppearTimeout={300}
          trnasitionEnterTimeout={300}
          transitionLeaveTimeout={300}
          >
          { showLoadingMessage &&
            <MessageComp message='Loading...' />
          }
        </CSSTransitionGroup>
        <CSSTransitionGroup
          transitionName={fade}
          transitionAppear={true}
          transitionAppearTimeout={300}
          trnasitionEnterTimeout={300}
          transitionLeaveTimeout={300}
          >
          { showErrorMessage &&
            <MessageComp 
              message={errorMessage}
              onMessageButtonClick={() => this.handleMessageButtonClick()}
            />
          }
        </CSSTransitionGroup>
        <div className={styles['app__tabs']}>
          <CSSTransitionGroup
            transitionName={scale}
            transitionAppear={true}
            transitionAppearTimeout={300}
            trnasitionEnterTimeout={300}
            transitionLeaveTimeout={300}
            >
          {fetchRequestStatus === 'success' && 
          <Tab data={contracts} onMenuItemIconClick={this.handleMenuItemIconClick}>
            {children}
          </Tab>        
          }
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }
}

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp);

App.displayName = 'App';

export default App;