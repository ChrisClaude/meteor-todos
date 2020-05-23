import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import {Tasks} from '../api/tasks.js';

import Task from './Task.js';
import AccountsUIWrapper from "./AccountsUIWrapper";

// App component - represents the whole app
class App extends Component {

    state = {
        textInput: "",
        hideCompleted: false,
    };

    renderTasks = () => {
        let filteredTasks = this.props.tasks;
        if (this.state.hideCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.checked);
        }

        return filteredTasks.map((task) => {
            const currentUserId = this.props.currentUser && this.props.currentUser._id;
            const showPrivateButton = task.owner === currentUserId;

            return (
                <Task
                    key={task._id}
                    task={task}
                    showPrivateButton={showPrivateButton}
                />
            );
        });
    }


    handleSubmit = event => {
        event.preventDefault();

        /* Tasks.insert({
             text: this.state.textInput,
             createdAt: new Date(), // current time
             owner: Meteor.userId(),           // _id of logged in user
             username: Meteor.user().username,  // username of logged in user
         });*/

        Meteor.call('tasks.insert', this.state.textInput);

        // Clear form
        this.setState({textInput: ""});
    }

    toggleHideCompleted = () => {
        this.setState({
            hideCompleted: !this.state.hideCompleted,
        });
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List ({this.props.incompleteCount})</h1>

                    <label className="hide-completed">
                        <input type="checkbox"
                               readOnly
                               checked={this.state.hideCompleted}
                               onClick={this.toggleHideCompleted}
                        />
                        Hide Completed
                    </label>

                    <AccountsUIWrapper/>
                    {
                        this.props.currentUser ? <form className="new-task" onSubmit={this.handleSubmit}>
                            <input
                                type="text"
                                ref="textInput"
                                placeholder="Type to add new tasks"
                                value={this.state.textInput}
                                onChange={(event) => {
                                    this.setState({textInput: event.target.value});
                                }}
                            />
                        </form> : ''
                    }

                </header>

                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('tasks');

    return {
        tasks: Tasks.find({}, {sort: {createdAt: -1}}).fetch(),
        incompleteCount: Tasks.find({checked: {$ne: true}}).count(),
        currentUser: Meteor.user(),
    };
})(App);