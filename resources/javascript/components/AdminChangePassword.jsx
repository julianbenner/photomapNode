var $ = require('jquery');
var React = require('react/addons');
var MapStore = require('./MapStore.js');
var FileStore = require('./FileStore.js');
var ApplicationStore = require('./ApplicationStore.js');
var classNames = require('classnames');

var AdminChangePassword = React.createClass({
  getInitialState: function () {
    return {
      status: '',
      message: ''
    };
  },

  componentDidMount: function () {
  },

  componentWillUnmount: function () {
  },

  changePassword: function () {
    const oldPw = React.findDOMNode(this.refs.oldPw).value;
    const newPw = React.findDOMNode(this.refs.newPw).value;
    const newPw2 = React.findDOMNode(this.refs.newPw2).value;

    if (newPw != newPw2) {
      this.setState({
        status: 'fail',
        message: 'Your new passwords do not match!'
      });
    } else {
      $.ajax({
        url: 'admin/change_password',
        type: 'POST',
        data: {
          user: ApplicationStore.getUser(),
          oldPw: oldPw,
          newPw: newPw
        },
        success: () => {
          this.setState({
            status: 'success',
            message: 'Your password was changed successfully!'
          });
        },
        error: reason => {
          this.setState({
            status: 'fail',
            message: reason.responseText
          });
        }
      });
    }
  },

  render: function () {
    const labelClasses = classNames({
      'label': true,
      'label-danger': this.state.status === 'fail',
      'label-success': this.state.status === 'success'
    });

    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Change your password</h3>
        </div>
        <div className="panel-body">
          <input type="password" className="form-control" placeholder="Old password" ref="oldPw" /><br/>
          <input type="password" className="form-control" placeholder="New password" ref="newPw" /><br/>
          <input type="password" className="form-control" placeholder="New password (repeat)" ref="newPw2" /><br/>
          <button type="button" className="btn btn-default" onClick={this.changePassword}>Change</button><br/>
          <span className={labelClasses}>{this.state.message}</span>
        </div>
      </div>
    );
  }
});

module.exports = AdminChangePassword;
