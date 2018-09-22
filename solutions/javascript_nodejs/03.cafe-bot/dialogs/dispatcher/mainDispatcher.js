// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { ComponentDialog, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { MessageFactory } = require('botbuilder');

const { BookTableDialog, ChitChatDialog, HelpDialog, QnADialog, WhatCanYouDoDialog, WhoAreYouDialog } = require('../../dialogs');
const { GenSuggestedQueries } = require('../shared/helpers');
const { OnTurnProperty } = require('../shared/stateProperties');

// dialog name
const MAIN_DISPATCHER_DIALOG = 'MainDispatcherDialog';

// consts for state properties
const USER_PROFILE_PROPERTY = 'userProfile';
const MAIN_DISPATCHER_STATE_PROPERTY = 'mainDispatcherState';
const RESERVATION_PROPERTY = 'reservationProperty';

// consts for cancel and none intent names
const NONE_INTENT = 'None';
const CANCEL_INTENT = 'Cancel';

// Query property from ../whatCanYouDo/resources/whatCanYHouDoCard.json
// When user responds to what can you do card, a query property is set in response.
const QUERY_PROPERTY = 'query';

module.exports = {
    MainDispatcher: class extends ComponentDialog {
        static get Name() { return MAIN_DISPATCHER_DIALOG; }

        /**
         * Constructor.
         *
         * @param {BotConfiguration} botConfig bot configuration
         * @param {StatePropertyAccessor} onTurnAccessor
         * @param {ConversationState} conversationState
         * @param {UserState} userState
         */
        constructor(botConfig, onTurnAccessor, conversationState, userState) {
            super(MAIN_DISPATCHER_DIALOG);

            if (!botConfig) throw ('Missing parameter. Bot Configuration is required.');
            if (!onTurnAccessor) throw ('Missing parameter. On turn property accessor is required.');
            if (!conversationState) throw ('Missing parameter. Conversation state is required.');
            if (!userState) throw ('Missing parameter. User state is required.');

            // Create state objects for user, conversation and dialog states.
            this.userProfileAccessor = conversationState.createProperty(USER_PROFILE_PROPERTY);
            this.mainDispatcherAccessor = conversationState.createProperty(MAIN_DISPATCHER_STATE_PROPERTY);
            this.reservationAccessor = conversationState.createProperty(RESERVATION_PROPERTY);

            // keep on turn accessor and bot configuration
            this.onTurnAccessor = onTurnAccessor;

            // add dialogs
            this.dialogs = new DialogSet(this.mainDispatcherAccessor);
            this.addDialog(new WhatCanYouDoDialog());
            this.addDialog(new QnADialog(botConfig, this.userProfileAccessor));
            this.addDialog(new WhoAreYouDialog(botConfig, conversationState, this.userProfileAccessor, onTurnAccessor, this.reservationAccessor));
            this.addDialog(new BookTableDialog(botConfig, this.reservationAccessor, onTurnAccessor, this.userProfileAccessor, conversationState));
        }

        /**
         * Override onDialogBegin
         *
         * @param {Object} dc dialog context
         * @param {Object} options dialog turn options
         */
        async onDialogBegin(dc, options) {
            // Override default begin() logic with bot orchestration logic
            return await this.mainDispatch(dc);
        }

        /**
         * Override onDialogContinue
         *
         * @param {Object} dc dialog context
         */
        async onDialogContinue(dc) {
            // Override default continue() logic with bot orchestration logic
            return await this.mainDispatch(dc);
        }

        /**
         * Main Dispatch
         *
         * This method examines the incoming turn property to determine
         * 1. If the requested operation is permissible - e.g. if user is in middle of a dialog,
         *     then an out of order reply should not be allowed.
         * 2. Calls any outstanding dialogs to continue
         * 3. If results is no-match from outstanding dialog .OR. if there are no outstanding dialogs,
         *    decide which child dialog should begin and start it
         *
         * @param {Object} dc dialog context
         */
        async mainDispatch(dc) {
            // get on turn property through the property accessor
            const onTurnProperty = await this.onTurnAccessor.get(dc.context);

            // Evaluate if the requested operation is possible/ allowed.
            const reqOpStatus = await this.isRequestedOperationPossible(dc.activeDialog, onTurnProperty.intent);
            if (!reqOpStatus.allowed) {
                await dc.context.sendActivity(reqOpStatus.reason);
                // Nothing to do here. End main dialog.
                return await dc.end();
            }

            // continue outstanding dialogs
            let dialogTurnResult = await dc.continue();

            // This will only be empty if there is no active dialog in the stack.
            // Removing check for dialogTurnStatus here will break successful cancellation of child dialogs.
            // E.g. who are you -> cancel -> yes flow.
            if (!dc.context.responded && dialogTurnResult !== undefined && dialogTurnResult.status !== DialogTurnStatus.complete) {
                // No one has responded so start the right child dialog.
                dialogTurnResult = await this.beginChildDialog(dc, onTurnProperty);
            }

            if (dialogTurnResult === undefined) return await dc.end();

            // Examine result from dc.continue() or from the call to beginChildDialog().
            switch (dialogTurnResult.status) {
            case DialogTurnStatus.complete: {
                // The active dialog finished successfully. Ask user if they need help with anything else.
                await dc.context.sendActivity(MessageFactory.suggestedActions(GenSuggestedQueries(), `Is there anything else I can help you with?`));
                break;
            }
            case DialogTurnStatus.waiting: {
                // The active dialog is waiting for a response from the user, so do nothing
                break;
            }
            case DialogTurnStatus.cancelled: {
                // The active dialog's stack has been cancelled
                await dc.cancelAll();
                break;
            }
            }
            return dialogTurnResult;
        }

        /**
         * Method to begin appropriate child dialog based on user input
         *
         * @param {DialogContext} dc
         * @param {OnTurnProperty} onTurnProperty
         */
        async beginChildDialog(dc, onTurnProperty) {
            switch (onTurnProperty.intent) {
            // Help, ChitChat and QnA share the same QnA Maker model. So just call the QnA Dialog.
            case QnADialog.Name:
            case ChitChatDialog.Name:
            case HelpDialog.Name:
                return await dc.begin(QnADialog.Name);
            case BookTableDialog.Name:
                return await dc.begin(BookTableDialog.Name);
            case WhoAreYouDialog.Name:
                return await dc.begin(WhoAreYouDialog.Name);
            case WhatCanYouDoDialog.Name:
                return await this.beginWhatCanYouDoDialog(dc, onTurnProperty);
            case NONE_INTENT:
            default:
                await dc.context.sendActivity(`I'm still learning.. Sorry, I do not know how to help you with that.`);
                return await dc.context.sendActivity(`Follow [this link](https://www.bing.com/search?q=${ dc.context.activity.text }) to search the web!`);
            }
        }

        /**
         * Method to evaluate if the requested user operation is possible.
         * User could be in the middle of a multi-turn dialog where interruption might not be possible or allowed.
         *
         * @param {String} activeDialog
         * @param {String} requestedOperation
         * @returns {Object} outcome object
         */
        async isRequestedOperationPossible(activeDialog, requestedOperation) {
            let outcome = { allowed: true, reason: '' };

            // E.g. What_can_you_do is not possible when you are in the middle of Who_are_you dialog
            if (requestedOperation === WhatCanYouDoDialog.Name) {
                if (activeDialog === WhoAreYouDialog.Name) {
                    outcome.allowed = false;
                    outcome.reason = `Sorry! I'm unable to process that. You can say 'cancel' to cancel this conversation..`;
                }
            } else if (requestedOperation === CANCEL_INTENT) {
                if (activeDialog === undefined) {
                    outcome.allowed = false;
                    outcome.reason = `Sure, but there is nothing to cancel..`;
                }
            }
            return outcome;
        }

        /**
         * Helper method to begin what can you do dialog.
         *
         * @param {Object} dc dialog context
         * @param {Object} onTurnProperty
         */
        async beginWhatCanYouDoDialog(dc, onTurnProperty) {
            // Handle case when user interacted with the what can you do card.
            // What can you do card sends a custom data property with intent name, text value and possible entities.
            // See ../whatCanYouDo/resources/whatCanYouDoCard.json for card definition.
            let queryProperty = (onTurnProperty.entities || []).filter(item => item.entityName == QUERY_PROPERTY);
            if (queryProperty.length !== 0) {
                let parsedJSON;
                try {
                    parsedJSON = JSON.parse(queryProperty[0].entityValue);
                } catch (err) {
                    return await dc.context.sendActivity(`Choose a query from the card drop down before you click 'Let's talk!'`);
                }
                if (parsedJSON.text !== undefined) {
                    dc.context.activity.text = parsedJSON.text;
                    await dc.context.sendActivity(`You said: '${ dc.context.activity.text }'`);
                }
                // create a set a new onturn property
                await this.onTurnAccessor.set(dc.context, OnTurnProperty.fromCardInput(parsedJSON));
                return await this.beginChildDialog(dc, parsedJSON);
            }
            return await dc.begin(WhatCanYouDoDialog.Name);
        }
    }
};
