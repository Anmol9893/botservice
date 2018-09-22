// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { TextPrompt } = require('botbuilder-dialogs');
const { MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { UserProfile } = require('../stateProperties');
const { InterruptionDispatcher } = require('../../interruptionDispatcher');

// LUIS service type entry for the get user profile LUIS model in the .bot file.
const LUIS_CONFIGURATION = 'getUserProfile';

// LUIS intent names from ./resources/getUserProfile.lu
const WHY_DO_YOU_ASK_INTENT = 'Why_do_you_ask';
const GET_USER_NAME_INTENT = 'Get_user_name';
const NO_NAME_INTENT = 'No_Name';
const NONE_INTENT = 'None';
const CANCEL_INTENT = 'Cancel';

// User name entity from ./resources/getUserProfile.lu
const USER_NAME = 'userName_patternAny';
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';
const HAVE_USER_PROFILE = true;
const NO_USER_PROFILE = false;
const CONFIRM_CANCEL_PROMPT = 'confirmCancelPrompt';

// This is a custom TextPrompt that uses a LUIS model to handle turn.n conversations including interruptions.
module.exports = class GetUserNamePrompt extends TextPrompt {
    /**
     * Constructor. 
     * 
     * @param {String} dialogId Dialog ID
     * @param {Object} botConfig Bot configuration
     * @param {Object} userProfileAccessor accessor for user profile property
     * @param {Object} conversationState conversations state
     */
    constructor(dialogId, botConfig, userProfileAccessor, conversationState, onTurnAccessor) {
        if (!dialogId) throw ('Missing parameter. Dialog ID is required.');
        if (!botConfig) throw ('Missing parameter. Bot configuration is required.');
        if (!userProfileAccessor) throw ('Missing parameter. User profile property accessor is required.');
        if (!conversationState) throw ('Missing parameter. Conversation state is required.');
        
        super (dialogId, async (turnContext, step) => { 
            // Prompt validator
            // Examine if we have a user name and validate it.
            if (this.userProfile.userName !== undefined) {
                // We can only accept user names that up to two words.
                if (this.userProfile.userName.split(' ').length > 2) {
                    await turnContext.sendActivity(`Sorry, I can only accept two words for a name.`);
                    await turnContext.sendActivity(`You can always say 'My name is <your name>' to introduce yourself to me.`);
                    await this.userProfileAccessor.set(context, new UserProfile('Human'));
                    step.end(NO_USER_PROFILE);
                } else {
                    // capitalize user name   
                    this.userProfile.userName = this.userProfile.userName.charAt(0).toUpperCase() + this.userProfile.userName.slice(1);
                    // Create user profile and set it to state.
                    await this.userProfileAccessor.set(turnContext, this.userProfile);
                    step.end(HAVE_USER_PROFILE);
                }
            }
        });

        this.userProfileAccessor = userProfileAccessor;
        this.turnCounterAccessor = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.onTurnAccessor = onTurnAccessor;
        this.userProfile = new UserProfile();
        
        // add recogizers
        const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId) throw (`Get User Profile LUIS configuration not found in .bot file. Please ensure you have all required LUIS models created and available in the .bot file. See readme.md for additional information\n`);
        this.luisRecognizer = new LuisRecognizer({
            applicationId: luisConfig.appId,
            azureRegion: luisConfig.region,
            // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
            endpointKey: luisConfig.authoringKey
        });
    }
    /**
     * Override dialogContinue.
     * 
     * @param {Object} dc dialog context
     */
    async dialogContinue(dc) {
        let context = dc.context;

        // Get turn counter
        let turnCounter = await this.turnCounterAccessor.get(context);
        turnCounter = (turnCounter === undefined) ? 0 : ++turnCounter;
        
        // We are not going to spend more than 3 turns to get user's name.
        if (turnCounter >= 3) {
            return await this.endGetUserNamePrompt(dc);
        }

        // set updated turn counter
        await this.turnCounterAccessor.set(context, turnCounter);

        // call LUIS and get results
        const LUISResults = await this.luisRecognizer.recognize(context); 
        const topIntent = LuisRecognizer.topIntent(LUISResults);
        
        // Did user ask for help or said they are not going to give us the name? 
        switch (topIntent) {
            case NO_NAME_INTENT: {
                // set user name in profile to Human
                await this.userProfileAccessor.set(context, new UserProfile('Human'));
                return await this.endGetUserNamePrompt(dc);
            }
            case GET_USER_NAME_INTENT: {
                // Find the user's name from LUIS entities list.
                if (USER_NAME in LUISResults.entities) {
                    this.userProfile.userName = LUISResults.entities[USER_NAME][0];
                    return await super.dialogContinue(dc);
                } else {
                    await context.sendActivity(`Sorry, I didn't get that. What's your name?`);
                    return await super.dialogContinue(dc);
                }
            }
            case WHY_DO_YOU_ASK_INTENT: {
                await context.sendActivity(`I need your name to be able to address you correctly!`);
                await context.sendActivity(MessageFactory.suggestedActions([`I won't give you my name`], `What is your name?`));
                return await super.dialogContinue(dc);
            }
            case NONE_INTENT: {
                this.userProfile.userName = context.activity.text;
                return await super.dialogContinue(dc);
            } case CANCEL_INTENT: {
                // start confirmation prompt
                return await dc.prompt(CONFIRM_CANCEL_PROMPT, `Are you sure you want to cancel?`);
            }
            default: {
                // Handle interruption.
                const onTurnProperty = await this.onTurnAccessor.get(dc.context);
                return await dc.begin(InterruptionDispatcher.Name, onTurnProperty);
            }
        }
    }
    /**
     * Helper method to end this prompt
     * 
     * @param {Object} dc 
     */
    async endGetUserNamePrompt(dc) {
        let context = dc.context;
        await context.sendActivity(`No worries. Hello Human, nice to meet you!`);
        await context.sendActivity(`You can always say 'My name is <your name>' to introduce yourself to me.`);
        // End this dialog since user does not wish to proceed further.
        return await dc.end(NO_USER_PROFILE);
    }
    /**
     * Override dialogResume. This is used to handle user's response to confirm cancel prompt.
     * 
     * @param {Object} dc 
     * @param {Object} reason 
     * @param {Object} result 
     */
    async dialogResume(dc, reason, result) {
        if(result) {
            // User said yes to cancel prompt.
            await dc.context.sendActivity(`Sure. I've cancelled that!`);
            return await dc.cancelAll();
        } else {
            // User said no to cancel.
            return await super.dialogResume(dc, reason, result)
        }
    }
}