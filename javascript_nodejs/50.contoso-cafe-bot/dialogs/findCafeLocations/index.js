// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { Dialog } = require('botbuilder-dialogs');

// This dialog's name. Also matches the name of the intent from ../mainDispatcher/resources/cafeDispatchModel.lu
// LUIS recognizer replaces spaces ' ' with '_'. So intent name 'Who are you' is recognized as 'Who_are_you'.
const FIND_CAFE_LOCATIONS_DIALOG = 'Find_Cafe_Locations';

module.exports = {
    FindCafeLocationsDialog: class extends Dialog {
        static get Name() { return FIND_CAFE_LOCATIONS_DIALOG; }
        constructor() {
            super (FIND_CAFE_LOCATIONS_DIALOG);
        }
        /**
         * Override dialogBegin. 
         * 
         * @param {Object} dc dialog context
         * @param {Object} options options
         */
        async dialogBegin(dc, options) {
            await dc.context.sendActivity(`I'm still learning to have a conversation about this topic!`);
            await dc.context.sendActivity(`But, for now, you can find Contoso Cafe locations at https://contosocafe.com`);
            return await dc.end();
        }
    }
}