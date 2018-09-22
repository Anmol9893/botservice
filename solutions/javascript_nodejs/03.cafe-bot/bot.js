// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, CardFactory, MessageFactory } = require('botbuilder');
const { DialogSet } = require('botbuilder-dialogs');
const { LuisRecognizer } = require('botbuilder-ai');
const { OnTurnProperty } = require('./dialogs/shared/stateProperties');
const { WelcomeCard } = require('./dialogs/welcome');
const { MainDispatcher } = require('./dialogs/dispatcher');

// LUIS service type entry in the .bot file for dispatch.
const LUIS_CONFIGURATION = 'cafeDispatchModel';

// State properties
const ON_TURN_PROPERTY = 'onTurnStateProperty';
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';

module.exports = {
    /**
     *
     * Bot Class is responsible for 4 main things -
     *   1. Handle different types of activities
     *   2. Process incoming activities and extract relevant information into an onTurnProperty object
     *   3. Route message to or start an instance of main dispatcher
     *   4. Welcome user(s) that might have joined the conversation
     *
     */
    Bot: class {
        /**
         * Bot constructor.
         *
         * @param {ConversationState} conversation state object
         * @param {UserState} user state object
         * @param {BotConfiguration} bot configuration
         *
         */
        constructor(conversationState, userState, botConfig) {
            if (!conversationState) throw ('Missing parameter. Conversation state is required.');
            if (!userState) throw ('Missing parameter. User state is required.');
            if (!botConfig) throw ('Missing parameter. Bot configuration is required.');

            // Create state property accessors.
            this.onTurnAccessor = conversationState.createProperty(ON_TURN_PROPERTY);
            this.dialogAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);

            // add recognizer
            const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
            if (!luisConfig || !luisConfig.appId) throw (`Cafe Dispatch LUIS model not found in .bot file. Please ensure you have all required LUIS models created and available in the .bot file. See readme.md for additional information.\n`);
            this.luisRecognizer = new LuisRecognizer({
                applicationId: luisConfig.appId,
                azureRegion: luisConfig.region,
                // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
                endpointKey: luisConfig.subscriptionKey
            });

            // add main dispatcher
            this.dialogs = new DialogSet(this.dialogAccessor);
            this.dialogs.add(new MainDispatcher(botConfig, this.onTurnAccessor, conversationState, userState));
        }
        /**
         * On turn dispatcher method.
         *   Responsible for processing turn input, gather relevant properties,
         *   and continues or begins main dialog.
         *
         * @param {Context} conversation context object
         *
         */
        async onTurn(context) {
            // See https://aka.ms/about-bot-activity-message to learn more about message and other activity types.
            switch (context.activity.type) {
            case ActivityTypes.Message: {
                // Process on turn input (card or NLP) and gather new properties
                // OnTurnProperty object has processed information from the input message activity.
                let onTurnProperties = await this.detectIntentAndEntities(context);
                if (onTurnProperties === undefined) break;

                // Set the state with gathered properties (intent/ entities) through the onTurnAccessor
                await this.onTurnAccessor.set(context, onTurnProperties);

                // Create dialog context.
                const dc = await this.dialogs.createContext(context);

                // Continue outstanding dialogs.
                await dc.continue();

                // Begin main dialog if no outstanding dialogs/ no one responded
                if (!dc.context.responded) {
                    await dc.begin(MainDispatcher.Name);
                }
                break;
            }
            case ActivityTypes.ConversationUpdate: {
                // Welcome user.
                await this.welcomeUser(context);
                break;
            }
            default: {
                // Handle other activity types as needed.
                break;
            }
            }
        }
        /**
         * Async helper method to get on turn properties from cards or NLU using https://LUIS.ai
         *
         * - All cards for this bot -
         *   1. Are adaptive cards. See https://adaptivecards.io to learn more.
         *   2. All cards include an 'intent' field under 'data' section and can include entities recognized.
         * - Bot also uses a dispatch LUIS model that includes trigger intents for all dialogs.
         *   See ./dialogs/dispatcher/resources/cafeDispatchModel.lu for a description of the dispatch model.
         *
         * @param {Context} context conversation context object
         *
         */
        async detectIntentAndEntities(context) {
            // Handle card input (if any), update state and return.
            if (context.activity.value !== undefined) {
                return OnTurnProperty.fromCardInput(context.activity.value);
            }

            // Acknowledge attachments from user.
            if (context.activity.attachments && context.activity.attachments.length !== 0) {
                await context.sendActivity(`Thanks for sending me that attachment. I'm still learning to process attachments.`);
                return undefined;
            }

            // Nothing to do for this turn if there is no text specified.
            if (context.activity.text === undefined || context.activity.text.trim() === '') {
                return;
            }

            // Call to LUIS recognizer to get intent + entities
            const LUISResults = await this.luisRecognizer.recognize(context);

            // Return new instance of on turn property from LUIS results.
            // Leverages static fromLUISResults method
            return OnTurnProperty.fromLUISResults(LUISResults);
        }
        /**
         * Async helper method to welcome all users that have joined the conversation.
         *
         * @param {Context} context conversation context object
         *
         */
        async welcomeUser(context) {
            // Do we have any new members added to the conversation?
            if (context.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in context.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message
                    // the 'bot' is the recipient for events from the channel,
                    // context.activity.membersAdded == context.activity.recipient.Id indicates the
                    // bot was added to the conversation.
                    if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                        // Welcome user.
                        await context.sendActivity(`Hello, I am the Contoso Cafe Bot!`);
                        await context.sendActivity(`I can help book a table and more..`);

                        // Send welcome card.
                        await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(WelcomeCard)));
                    }
                }
            }
        }
    }
};
